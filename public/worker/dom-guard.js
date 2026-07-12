// DOM レッスンの「安全弁」Worker。
//
// プレビューは iframe の中で本物の DOM を触って動かす（クリックなどを本当に体験させたいため）。
// ただし iframe 内の無限ループはページごと固まらせる可能性があるので、
// 実際に iframe で走らせる前に、まずこの Worker で同じコードを試走させる。
//   - document / window はダミー（何を呼んでもエラーにならない Proxy）に差し替える
//   - ここで 3 秒以内に終わらなければ「無限ループの疑いあり」として iframe では実行しない
// 出力（console.log）はプレビュー本番の方で取るので、ここでは捨てる。

// 何をしても落ちないダミーオブジェクト（プロパティ参照・呼び出し・new すべてを受ける）
function makeStub() {
  const target = function () {};
  return new Proxy(target, {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive) return () => "";
      if (prop === Symbol.iterator) return function* () {};
      if (prop === "then") return undefined; // await で止まらないように
      if (prop === "length") return 0;
      if (prop === "value" || prop === "textContent" || prop === "innerHTML") return "";
      return makeStub();
    },
    set() {
      return true;
    },
    has() {
      return true;
    },
    apply() {
      return makeStub();
    },
    construct() {
      return makeStub();
    },
  });
}

const fetchUsers = () => Promise.resolve([]);
const fetchPosts = () => Promise.resolve([]);

self.onmessage = async (e) => {
  const { code } = e.data;
  const noop = () => {};
  const silentConsole = { log: noop, info: noop, warn: noop, error: noop };
  try {
    const fn = new Function(
      "console",
      "document",
      "window",
      "alert",
      "fetchUsers",
      "fetchPosts",
      "React",
      "ReactDOM",
      "useState",
      "useEffect",
      "useRef",
      `return (async () => {\n${code}\n})();`
    );
    await fn(
      silentConsole,
      makeStub(),
      makeStub(),
      noop,
      fetchUsers,
      fetchPosts,
      makeStub(),
      makeStub(),
      () => [makeStub(), noop], // useState のダミー
      noop,
      () => makeStub()
    );
  } catch {
    // 試走中のエラーは無視する（本番の iframe 実行でエラーを出して学習者に見せる）
  }
  self.postMessage({ type: "done" });
};
