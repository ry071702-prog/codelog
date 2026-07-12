// TypeScript レッスン用の実行 Worker。
//
// 本物の tsc（typescript.js）をこの Worker に読み込み、
//   1. 型チェック（strict）
//   2. 型エラーがあれば、そこで止めてエラーを返す（＝実行前にバグが見つかる、を体験させる）
//   3. エラーがなければ JavaScript に変換して実行し、console.log を返す
// という流れで動く。JS 用の runner.js と同じく別スレッドなので、UI は固まらない。
//
// typescript.js は 8MB ほどあるため、TS レッスンを開いたときにだけ読み込まれる
// （ブラウザにキャッシュされるので2回目以降は速い）。

let ready = false;
let libSource = "";

function fetchSync(path) {
  const req = new XMLHttpRequest(); // Worker 内なので同期取得してよい
  req.open("GET", path, false);
  req.send(null);
  return req.responseText;
}

function setup() {
  if (ready) return;
  self.importScripts("/vendor/ts/typescript.js");
  libSource = fetchSync("/vendor/ts/lib.bundle.d.ts");
  // 型エラーの文言を日本語にする（TypeScript 公式の翻訳）
  try {
    self.ts.setLocalizedDiagnosticMessages(
      JSON.parse(fetchSync("/vendor/ts/messages.ja.json"))
    );
  } catch {
    // 翻訳が読めなければ英語のまま出す（機能は落とさない）
  }
  ready = true;
}

const FILE_NAME = "script.ts";
const LIB_NAME = "lib.d.ts";

const COMPILER_OPTIONS = {
  target: 99, // ESNext
  module: 99, // ESNext（トップレベル await を許す）
  moduleDetection: 3, // force = このファイルをモジュールとして扱う
  strict: true,
  skipLibCheck: true,
};

/** 型チェックして、見つかった問題を人が読める形にして返す */
function typeCheck(code) {
  const ts = self.ts;
  // 末尾に export {} を足して「モジュール」として扱わせる。
  // こうしないと、レッスンで使うトップレベル await が構文エラーになる。
  // （末尾に足すだけなので、エラーの行番号はユーザーのコードとずれない）
  const checked = `${code}\nexport {};`;
  const sourceFile = ts.createSourceFile(
    FILE_NAME,
    checked,
    COMPILER_OPTIONS.target,
    true
  );
  const libFile = ts.createSourceFile(
    LIB_NAME,
    libSource,
    COMPILER_OPTIONS.target,
    true
  );

  const host = {
    getSourceFile: (name) =>
      name === FILE_NAME ? sourceFile : name === LIB_NAME ? libFile : undefined,
    getDefaultLibFileName: () => LIB_NAME,
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getDirectories: () => [],
    fileExists: (name) => name === FILE_NAME || name === LIB_NAME,
    readFile: (name) =>
      name === FILE_NAME ? checked : name === LIB_NAME ? libSource : undefined,
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
  };

  const program = ts.createProgram([FILE_NAME], COMPILER_OPTIONS, host);
  const diagnostics = [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
  ];

  return diagnostics.map((d) => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, " ");
    if (d.file && typeof d.start === "number") {
      const { line } = d.file.getLineAndCharacterOfPosition(d.start);
      return `${line + 1}行目: ${message}`;
    }
    return message;
  });
}

function formatArg(a) {
  if (typeof a === "string") return a;
  if (a === null) return "null";
  if (a === undefined) return "undefined";
  if (typeof a === "object") {
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  }
  return String(a);
}

// 非同期レッスン用の擬似API（JS 側の runner.js と同じデータ）
const fetchUsers = () =>
  new Promise((res) =>
    setTimeout(
      () =>
        res([
          { name: "Aoi", age: 24 },
          { name: "Ken", age: 31 },
          { name: "Mei", age: 28 },
        ]),
      250
    )
  );

const fetchPosts = () =>
  new Promise((res) =>
    setTimeout(
      () =>
        res([
          { author: "Aoi", title: "朝のコーヒー記録" },
          { author: "Ken", title: "週末の登山ログ" },
          { author: "Aoi", title: "読書メモ #12" },
          { author: "Mei", title: "自作キーボード日記" },
          { author: "Ken", title: "ランニング 5km" },
        ]),
      250
    )
  );

self.onmessage = async (e) => {
  const { code } = e.data;

  try {
    setup();
  } catch {
    self.postMessage({
      type: "error",
      text: "TypeScript の読み込みに失敗しました。通信環境を確認して、もう一度実行してみて。",
    });
    self.postMessage({ type: "done" });
    return;
  }

  // ── 1. 型チェック
  let errors;
  try {
    errors = typeCheck(code);
  } catch (err) {
    errors = [String(err && err.message ? err.message : err)];
  }

  if (errors.length > 0) {
    self.postMessage({ type: "type-error", text: "型エラー（実行前に見つかった）" });
    errors.slice(0, 8).forEach((text) => {
      self.postMessage({ type: "error", text });
    });
    self.postMessage({ type: "done" });
    return;
  }

  // ── 2. 型が通ったので、JavaScript に変換して実行する
  self.postMessage({ type: "compiled" }); // ここから先はユーザーのコードの実行時間

  // モジュール扱いで変換すると末尾に `export {};` が付く。
  // ここでは関数の中で実行するため、その行だけ取り除く。
  const js = self.ts
    .transpileModule(code, {
      compilerOptions: { target: 99, module: 99, moduleDetection: 3 },
    })
    .outputText.replace(/^\s*export\s*\{\s*\};?\s*$/gm, "");

  const push = (type) => (...args) =>
    self.postMessage({ type, text: args.map(formatArg).join(" ") });
  const sandboxConsole = {
    log: push("log"),
    info: push("log"),
    warn: push("warn"),
    error: push("error"),
  };

  try {
    const fn = new Function(
      "console",
      "fetchUsers",
      "fetchPosts",
      `return (async () => {\n${js}\n})();`
    );
    await fn(sandboxConsole, fetchUsers, fetchPosts);
  } catch (err) {
    self.postMessage({
      type: "error",
      text: String(err && err.message ? err.message : err),
    });
  }
  self.postMessage({ type: "done" });
};
