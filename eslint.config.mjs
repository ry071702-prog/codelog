import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // プロトタイプ（参照用・移植元の正）は lint 対象外
    "codelog.jsx",
    // TS レッスン用に node_modules からコピーしてくる生成物
    "public/vendor/**",
  ]),
]);

export default eslintConfig;
