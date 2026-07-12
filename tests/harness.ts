// テスト用の「レッスン実行エンジン」。
//
// 本番はブラウザ（Worker / iframe）でコードを動かしているが、テストでは同じことを
// Node + jsdom の上で再現する。目的は「模範解答を実行すると、そのレッスンの
// check 関数が本当に true を返すか」を機械的に確かめること。
//
// 本番と揃えるべき点:
//   - console.log の収集（Log[]）
//   - 擬似API fetchUsers / fetchPosts
//   - TS レッスンは型チェックを通す
//   - JSX レッスンは React に変換して実行する
//   - DOM / React レッスンは #app の innerHTML をクリア判定に渡す

import ts from "typescript";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import type { Lesson, Log } from "@/lib/lessons";

export const fetchUsers = () =>
  Promise.resolve([
    { name: "Aoi", age: 24 },
    { name: "Ken", age: 31 },
    { name: "Mei", age: 28 },
  ]);

export const fetchPosts = () =>
  Promise.resolve([
    { author: "Aoi", title: "朝のコーヒー記録" },
    { author: "Ken", title: "週末の登山ログ" },
    { author: "Aoi", title: "読書メモ #12" },
    { author: "Mei", title: "自作キーボード日記" },
    { author: "Ken", title: "ランニング 5km" },
  ]);

function makeConsole(logs: Log[]) {
  const push = (type: Log["type"]) =>
    (...args: unknown[]) => {
      logs.push({
        type,
        text: args
          .map((a) =>
            typeof a === "string"
              ? a
              : a === null
                ? "null"
                : a === undefined
                  ? "undefined"
                  : typeof a === "object"
                    ? JSON.stringify(a)
                    : String(a)
          )
          .join(" "),
      });
    };
  return { log: push("log"), info: push("log"), warn: push("warn"), error: push("error") };
}

/** TS レッスン: 型チェック（strict）。返り値は見つかったエラー */
export function typeCheck(code: string, libSource: string): string[] {
  const FILE = "script.ts";
  const LIB = "lib.d.ts";
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleDetection: ts.ModuleDetectionKind.Force,
    strict: true,
    skipLibCheck: true,
  };
  const checked = `${code}\nexport {};`;
  const sourceFile = ts.createSourceFile(FILE, checked, options.target!, true);
  const libFile = ts.createSourceFile(LIB, libSource, options.target!, true);

  const host: ts.CompilerHost = {
    getSourceFile: (name) =>
      name === FILE ? sourceFile : name === LIB ? libFile : undefined,
    getDefaultLibFileName: () => LIB,
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getDirectories: () => [],
    fileExists: (name) => name === FILE || name === LIB,
    readFile: (name) => (name === FILE ? checked : name === LIB ? libSource : undefined),
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
  };

  const program = ts.createProgram([FILE], options, host);
  return [
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
  ].map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "));
}

/** MODULE 09 用のミニテストランナー（public/worker/runner.js と同じ挙動） */
function makeTestApi(logs: Log[]) {
  const isEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
      return false;
    }
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length !== kb.length) return false;
    return ka.every((k) =>
      isEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    );
  };
  const show = (v: unknown) => {
    try {
      return typeof v === "string" ? `"${v}"` : JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const expectFn = (actual: unknown) => ({
    toBe(expected: unknown) {
      if (!Object.is(actual, expected)) {
        throw new Error(`${show(expected)} を期待したが ${show(actual)} だった`);
      }
    },
    toEqual(expected: unknown) {
      if (!isEqual(actual, expected)) {
        throw new Error(`${show(expected)} を期待したが ${show(actual)} だった`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error("真であることを期待した");
    },
    toBeFalsy() {
      if (actual) throw new Error("偽であることを期待した");
    },
    toContain(item: unknown) {
      const ok = Array.isArray(actual)
        ? actual.includes(item)
        : typeof actual === "string" && actual.includes(String(item));
      if (!ok) throw new Error("含まれていない");
    },
    toThrow() {
      let threw = false;
      try {
        (actual as () => void)();
      } catch {
        threw = true;
      }
      if (!threw) throw new Error("エラーが投げられなかった");
    },
  });

  const testFn = async (name: string, fn: () => unknown) => {
    try {
      await fn();
      logs.push({ type: "log", text: `✓ ${name}` });
    } catch (err) {
      logs.push({
        type: "error",
        text: `✗ ${name} — ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  return { testFn, expectFn };
}

/** コンソール系レッスン（JS / TS）を実行してログを集める */
export async function runConsoleLesson(code: string, lang?: string): Promise<Log[]> {
  const logs: Log[] = [];
  const js =
    lang === "ts"
      ? ts
          .transpileModule(code, {
            compilerOptions: {
              target: ts.ScriptTarget.ESNext,
              module: ts.ModuleKind.ESNext,
              moduleDetection: ts.ModuleDetectionKind.Force,
            },
          })
          .outputText.replace(/^\s*export\s*\{\s*\};?\s*$/gm, "")
      : code;

  const { testFn, expectFn } = makeTestApi(logs);
  const fn = new Function(
    "console",
    "fetchUsers",
    "fetchPosts",
    "test",
    "expect",
    `return (async () => {\n${js}\n})();`
  );
  await fn(makeConsole(logs), fetchUsers, fetchPosts, testFn, expectFn);
  return logs;
}

export interface PreviewResult {
  logs: Log[];
  dom: string;
  cleared: boolean;
}

/**
 * プレビュー系レッスン（DOM / React）を jsdom で実行する。
 * 本番と同じく「実行したあとユーザーが操作する」ところまで再現するため、
 * 入力欄に文字を入れ、ボタンを1回ずつ押してから画面の状態を返す。
 */
export async function runPreviewLesson(
  lesson: Lesson,
  /** クリア判定。操作のたびに評価し、true になった時点で止める */
  check?: (logs: Log[], code: string, dom: string) => boolean
): Promise<PreviewResult> {
  const logs: Log[] = [];
  document.body.innerHTML = `<div id="app">${lesson.preview!.html}</div>`;
  const app = document.getElementById("app")!;

  const isReact = lesson.lang === "jsx";
  const code = solutionOf(lesson);
  const js = isReact
    ? ts.transpileModule(code, {
        fileName: "script.jsx",
        compilerOptions: {
          target: ts.ScriptTarget.ESNext,
          jsx: ts.JsxEmit.React,
        },
      }).outputText
    : code;

  // プレビュー iframe と同じく、代わりの localStorage を渡す
  const store: Record<string, string> = {};
  const localStorageShim = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  const ReactDOMShim = { createRoot };

  await act(async () => {
    const fn = new Function(
      "console",
      "fetchUsers",
      "fetchPosts",
      "localStorage",
      "React",
      "ReactDOM",
      "useState",
      "useEffect",
      "useRef",
      `return (async () => {\n${js}\n})();`
    );
    await fn(
      makeConsole(logs),
      fetchUsers,
      fetchPosts,
      localStorageShim,
      React,
      ReactDOMShim,
      React.useState,
      React.useEffect,
      React.useRef
    );
  });

  await act(async () => {
    await new Promise((r) => setTimeout(r, 400)); // 擬似APIの待ち時間
  });

  const cleared = () => !!check && check(logs, code, app.innerHTML);
  if (cleared()) return { logs, dom: app.innerHTML, cleared: true };

  // ユーザーの操作を再現する。
  // 入力欄を埋めてから、ボタンを1つずつ押し、押すたびにクリア判定を見る
  // （+1 / -1 のように打ち消し合うボタンがあるため、全部押してから見ると成立しない）。
  for (const input of Array.from(app.querySelectorAll("input"))) {
    await act(async () => {
      setReactInputValue(input, "テスト");
    });
  }

  for (let round = 0; round < 2; round++) {
    for (const button of Array.from(app.querySelectorAll("button"))) {
      await act(async () => {
        button.click();
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 300));
      });
      if (cleared()) return { logs, dom: app.innerHTML, cleared: true };
    }
  }

  return { logs, dom: app.innerHTML, cleared: cleared() };
}

/** React の制御コンポーネントに値を入れる（value の setter を直接叩く必要がある） */
function setReactInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

// solutions は循環 import を避けるためここで受け取る形にする
let solutions: Record<string, string> = {};
export function setSolutions(map: Record<string, string>) {
  solutions = map;
}
export function solutionOf(lesson: Lesson): string {
  return solutions[lesson.id] ?? lesson.task!.starter;
}
