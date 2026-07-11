// コード実行用 Web Worker。
// ページとは別スレッドで動くため、無限ループでも UI は固まらず、
// 呼び出し側から terminate() で強制停止できる。DOM や storage には触れない。

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

// 非同期レッスン用の擬似API（外部通信なしで「データ取得」を体験する）
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
      `return (async () => {\n${code}\n})();`
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
