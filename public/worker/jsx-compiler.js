// React レッスン（MODULE 07）用の JSX 変換 Worker。
//
// ブラウザはそのままでは JSX を読めないので、実行前に JavaScript へ変換する。
// 変換には MODULE 06 で使っている本物の TypeScript コンパイラを流用する。
// jsx: "react"（クラシック変換）で <App /> → React.createElement(App) になるため、
// プレビュー側で React をグローバルに置いておけば import なしで動く。
//
// ここでは型チェックはしない（React の型定義まで読むと重くなるため）。
// 構文エラーだけは変換時に検出して返す。

let ready = false;

function setup() {
  if (ready) return;
  self.importScripts("/vendor/ts/typescript.js");
  try {
    const req = new XMLHttpRequest();
    req.open("GET", "/vendor/ts/messages.ja.json", false);
    req.send(null);
    self.ts.setLocalizedDiagnosticMessages(JSON.parse(req.responseText));
  } catch {
    // 翻訳が読めなければ英語のまま出す
  }
  ready = true;
}

self.onmessage = (e) => {
  const { code } = e.data;

  try {
    setup();
  } catch {
    self.postMessage({
      type: "error",
      text: "React の準備に失敗しました。通信環境を確認して、もう一度実行してみて。",
    });
    return;
  }

  const ts = self.ts;
  const result = ts.transpileModule(code, {
    fileName: "script.jsx",
    reportDiagnostics: true,
    compilerOptions: {
      target: 99, // ESNext
      jsx: 2, // React（React.createElement を出力）
    },
  });

  const errors = (result.diagnostics ?? []).map((d) => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, " ");
    if (d.file && typeof d.start === "number") {
      const { line } = d.file.getLineAndCharacterOfPosition(d.start);
      return `${line + 1}行目: ${message}`;
    }
    return message;
  });

  if (errors.length > 0) {
    self.postMessage({ type: "syntax-error", errors });
    return;
  }

  self.postMessage({ type: "compiled", js: result.outputText });
};
