// DOM レッスンのプレビュー実行エンジン（クライアント側）。
//
// 2 段構え:
//   1. guardCode()  … Worker でコードを試走し、無限ループでないことを確かめる（3秒）
//   2. buildSrcDoc() … 問題なければ sandbox iframe の srcDoc を組み立て、本物の DOM で実行する
//
// iframe は sandbox="allow-scripts"（allow-same-origin なし）で読み込むため、
// 中のコードは codelog 本体の DOM・localStorage・Cookie には一切触れない。

import type { Preview } from "@/lib/lessons";

const GUARD_TIMEOUT_MS = 3000;

/** プレビューから親ページへ送られるメッセージ */
export interface PreviewMessage {
  source: "codelog-preview";
  runId: number;
  type: "log" | "warn" | "error" | "dom" | "done";
  text?: string;
  html?: string;
}

/**
 * 無限ループ検査。true = 3秒以内に終わったので iframe で実行してよい。
 * DOM 呼び出しはダミーに差し替えて試走するので、画面には何も起きない。
 */
export function guardCode(code: string): Promise<boolean> {
  return new Promise((resolve) => {
    const worker = new Worker("/worker/dom-guard.js");
    const timer = setTimeout(() => {
      worker.terminate();
      resolve(false);
    }, GUARD_TIMEOUT_MS);

    const finish = (ok: boolean) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(ok);
    };

    worker.onmessage = () => finish(true);
    worker.onerror = () => finish(true); // 構文エラー等は iframe 側で見せる
    worker.postMessage({ code });
  });
}

const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0; padding: 20px;
    font-family: system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif;
    color: #1b1f2a; background: #ffffff; line-height: 1.7;
  }
  h1 { font-size: 22px; margin: 0 0 12px; }
  h2 { font-size: 18px; margin: 0 0 10px; }
  p { margin: 0 0 10px; }
  ul, ol { margin: 0 0 10px; padding-left: 22px; }
  li { margin: 2px 0; }
  button {
    font: inherit; padding: 8px 15px; margin-right: 6px;
    border: 1px solid #d9dce7; border-radius: 10px;
    background: #f4f5f8; color: #1b1f2a; cursor: pointer;
  }
  button:hover { border-color: #4b54e8; color: #4b54e8; }
  input {
    font: inherit; padding: 8px 12px; margin-right: 6px;
    border: 1px solid #d9dce7; border-radius: 10px; background: #fff; color: #1b1f2a;
  }
  input:focus { outline: none; border-color: #4b54e8; }
  .card { border: 1px solid #e6e8ef; border-radius: 12px; padding: 14px; }
  .highlight { background: #fff8c5; }
  .done { text-decoration: line-through; color: #aeb4c6; }
`;

/**
 * ユーザーのコードを <script> の中に安全に埋め込む。
 * JSON 文字列にしたうえで < をエスケープし、コード中に "</script>" と書かれても
 * スクリプトタグが途中で閉じてしまわないようにする。
 */
function embed(code: string): string {
  return JSON.stringify(code).replace(/</g, "\\u003c");
}

/** プレビュー iframe に読み込む HTML を組み立てる */
export function buildSrcDoc(preview: Preview, code: string, runId: number): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<style>${BASE_CSS}${preview.css ?? ""}</style>
</head>
<body>
<div id="app">${preview.html}</div>
<script>
(function () {
  var RUN_ID = ${runId};
  var app = document.getElementById("app");

  function send(type, payload) {
    parent.postMessage(
      Object.assign({ source: "codelog-preview", runId: RUN_ID, type: type }, payload || {}),
      "*"
    );
  }

  function format(a) {
    if (typeof a === "string") return a;
    if (a === null) return "null";
    if (a === undefined) return "undefined";
    if (a instanceof Error) return a.message;
    if (a && a.nodeType === 1) return "<" + a.tagName.toLowerCase() + ">";
    if (typeof a === "object") {
      try { return JSON.stringify(a); } catch (e) { return String(a); }
    }
    return String(a);
  }

  var proxy = function (type) {
    return function () {
      send(type, { text: Array.prototype.map.call(arguments, format).join(" ") });
    };
  };
  var sandboxConsole = { log: proxy("log"), info: proxy("log"), warn: proxy("warn"), error: proxy("error") };

  // 画面が変わるたびにスナップショットを親へ送る（クリックでクリア判定できるように）
  var snapshot = function () { send("dom", { html: app.innerHTML }); };
  new MutationObserver(snapshot).observe(app, { childList: true, subtree: true, attributes: true, characterData: true });

  window.onerror = function (msg) { send("error", { text: String(msg) }); };
  window.addEventListener("unhandledrejection", function (e) {
    send("error", { text: String(e.reason && e.reason.message ? e.reason.message : e.reason) });
  });

  // 非同期レッスン用の擬似API（Worker 側と同じデータ）
  var fetchUsers = function () {
    return new Promise(function (res) {
      setTimeout(function () {
        res([{ name: "Aoi", age: 24 }, { name: "Ken", age: 31 }, { name: "Mei", age: 28 }]);
      }, 250);
    });
  };
  var fetchPosts = function () {
    return new Promise(function (res) {
      setTimeout(function () {
        res([
          { author: "Aoi", title: "朝のコーヒー記録" },
          { author: "Ken", title: "週末の登山ログ" },
          { author: "Aoi", title: "読書メモ #12" },
          { author: "Mei", title: "自作キーボード日記" },
          { author: "Ken", title: "ランニング 5km" }
        ]);
      }, 250);
    });
  };

  var code = ${embed(code)};
  (async function () {
    try {
      var fn = new Function("console", "fetchUsers", "fetchPosts", "return (async () => {\\n" + code + "\\n})();");
      await fn(sandboxConsole, fetchUsers, fetchPosts);
    } catch (err) {
      send("error", { text: String(err && err.message ? err.message : err) });
    }
    snapshot();
    send("done");
  })();
})();
</script>
</body>
</html>`;
}
