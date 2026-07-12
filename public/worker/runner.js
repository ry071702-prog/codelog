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

// ── MODULE 09（テスト）用のミニテストランナー。
// Vitest / Jest とほぼ同じ書き味（test / expect / toBe ...）をブラウザ内で再現する。
// 実務のテストコードがそのまま読める・書けるようになることが狙い。
function makeTestApi(report) {
  const isEqual = (a, b) => {
    if (a === b) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
      return false;
    }
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => isEqual(a[k], b[k]));
  };

  const show = (v) => {
    try {
      return typeof v === "string" ? `"${v}"` : JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const expect = (actual) => ({
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        throw new Error(`${show(expected)} を期待したが ${show(actual)} だった`);
      }
    },
    toEqual(expected) {
      if (!isEqual(actual, expected)) {
        throw new Error(`${show(expected)} を期待したが ${show(actual)} だった`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`真であることを期待したが ${show(actual)} だった`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`偽であることを期待したが ${show(actual)} だった`);
    },
    toContain(item) {
      const ok = Array.isArray(actual)
        ? actual.includes(item)
        : typeof actual === "string" && actual.includes(item);
      if (!ok) throw new Error(`${show(actual)} は ${show(item)} を含んでいない`);
    },
    toThrow() {
      if (typeof actual !== "function") {
        throw new Error("toThrow には関数を渡す（expect(() => f()).toThrow()）");
      }
      let threw = false;
      try {
        actual();
      } catch {
        threw = true;
      }
      if (!threw) throw new Error("エラーが投げられることを期待したが、投げられなかった");
    },
  });

  const test = async (name, fn) => {
    try {
      await fn();
      report.passed += 1;
      self.postMessage({ type: "log", text: `✓ ${name}` });
    } catch (err) {
      report.failed += 1;
      self.postMessage({
        type: "error",
        text: `✗ ${name} — ${err && err.message ? err.message : err}`,
      });
    }
  };

  return { test, expect };
}

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

  const report = { passed: 0, failed: 0 };
  const { test, expect } = makeTestApi(report);

  try {
    const fn = new Function(
      "console",
      "fetchUsers",
      "fetchPosts",
      "test",
      "expect",
      `return (async () => {\n${code}\n})();`
    );
    await fn(sandboxConsole, fetchUsers, fetchPosts, test, expect);
  } catch (err) {
    self.postMessage({
      type: "error",
      text: String(err && err.message ? err.message : err),
    });
  }

  if (report.passed + report.failed > 0) {
    self.postMessage({
      type: report.failed > 0 ? "warn" : "log",
      text: `\n${report.passed} passed, ${report.failed} failed`,
    });
  }
  self.postMessage({ type: "done" });
};
