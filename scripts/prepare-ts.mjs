// レッスンの実行環境をブラウザに用意するスクリプト。
//
// MODULE 06（TypeScript）用に node_modules から
//   - typescript.js（コンパイラ本体。型チェックと JSX 変換に使う）
//   - 標準ライブラリの型定義（lib.*.d.ts）を1つに束ねたもの
//   - 型エラーの日本語訳
// を public/vendor/ts/ に、
//
// MODULE 07（React）用に
//   - React / ReactDOM をブラウザのグローバルとして使える1ファイル
// を public/vendor/react/ に用意する。
//
// public/vendor/ は生成物なので git 管理しない。npm run dev / build の前に自動で走る。

import { createRequire } from "node:module";
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import * as esbuild from "esbuild";

const require = createRequire(import.meta.url);
const tsLibDir = dirname(require.resolve("typescript/lib/typescript.js"));
const outDir = new URL("../public/vendor/ts/", import.meta.url).pathname;

// 束ねる標準ライブラリ。ES2020 までの言語機能 + ブラウザの型（DOM）。
const LIB_FILES = [
  "lib.es5.d.ts",
  "lib.es2015.core.d.ts",
  "lib.es2015.collection.d.ts",
  "lib.es2015.iterable.d.ts",
  "lib.es2015.generator.d.ts",
  "lib.es2015.promise.d.ts",
  "lib.es2015.symbol.d.ts",
  "lib.es2015.symbol.wellknown.d.ts",
  "lib.es2016.array.include.d.ts",
  "lib.es2017.object.d.ts",
  "lib.es2017.string.d.ts",
  "lib.es2018.asynciterable.d.ts",
  "lib.es2019.array.d.ts",
  "lib.es2019.object.d.ts",
  "lib.es2019.string.d.ts",
  "lib.es2020.bigint.d.ts",
  "lib.es2020.promise.d.ts",
  "lib.es2020.string.d.ts",
  "lib.dom.d.ts",
];

await mkdir(outDir, { recursive: true });
await copyFile(join(tsLibDir, "typescript.js"), join(outDir, "typescript.js"));
// 型エラーの文言を日本語にする（TypeScript 公式の翻訳ファイル）
await copyFile(
  join(tsLibDir, "ja", "diagnosticMessages.generated.json"),
  join(outDir, "messages.ja.json")
);

const parts = [];
for (const file of LIB_FILES) {
  const text = await readFile(join(tsLibDir, file), "utf8");
  // /// <reference lib="..." /> は1ファイルに束ねると不要（未解決エラーの元になる）
  parts.push(text.replace(/^\/\/\/\s*<reference.*$/gm, ""));
}
// codelog がレッスン中に提供している擬似API。型チェックでも「ある」ものとして扱う
parts.push(`
declare function fetchUsers(): Promise<{ name: string; age: number }[]>;
declare function fetchPosts(): Promise<{ author: string; title: string }[]>;
`);

await writeFile(join(outDir, "lib.bundle.d.ts"), parts.join("\n"), "utf8");

console.log(
  `prepare: typescript.js と lib.bundle.d.ts を public/vendor/ts/ に用意しました（lib ${LIB_FILES.length} ファイル）`
);

// ── React（MODULE 07）
// React 19 は UMD 版を配布していないので、esbuild でブラウザ向けに1つに束ねる。
// プレビュー iframe から <script> で読み込み、React / ReactDOM をグローバルとして使う。
const reactOutDir = new URL("../public/vendor/react/", import.meta.url).pathname;
await mkdir(reactOutDir, { recursive: true });

await esbuild.build({
  stdin: {
    contents: `
      import * as React from "react";
      import { createRoot } from "react-dom/client";
      globalThis.React = React;
      globalThis.ReactDOM = { createRoot };
    `,
    resolveDir: new URL("..", import.meta.url).pathname,
    loader: "js",
  },
  bundle: true,
  format: "iife",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: join(reactOutDir, "react.js"),
  logLevel: "warning",
});

console.log("prepare: React / ReactDOM を public/vendor/react/react.js に束ねました");
