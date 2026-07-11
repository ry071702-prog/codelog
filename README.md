# codelog()

読んで、動かして、書いて学ぶ JavaScript 学習サイト。

ブラウザの上でそのままコードを書いて実行できる。全4モジュール・26レッスンを順番に進めるだけで、変数からクラス・非同期・並列処理まで、入門書一冊ぶんの基礎が身につく。専門用語はレッスン本文中のタップでその場に定義が出て、用語集ページで検索もできる。

## 機能

- **26レッスン / 4モジュール** — 土台 → 一歩深く → データを自在に → 設計とモダンJS。各レッスンは「読む → 例を読む → 自分で書く → 実行してクリア判定」の流れ
- **ブラウザ内コード実行** — Web Worker による隔離実行。無限ループを書いても UI は固まらず、3秒でタイムアウト停止する
- **クリア判定と進捗保存** — レッスンごとの check 関数で自動判定。進捗と書きかけコードは localStorage に保存され、リロードしても残る
- **用語集** — 90語超の専門用語（JS文法 / Git・GitHub / 開発現場の言葉 / AI用語）を検索・カテゴリで絞り込み。レッスン本文中の用語はタップでポップアップ定義

## 技術構成

- **Next.js (App Router) + TypeScript + Tailwind CSS** — Vercel にデプロイ（push で自動デプロイ）
- **レッスンデータ**: `lib/lessons.ts` — クリア判定の check 関数を含むため JSON ではなく TS モジュール
- **実行エンジン**: `public/worker/runner.js` + `lib/runner.ts` — 実行のたびに Worker を使い捨てで生成し、`postMessage` でログを受け取る。ページの DOM・storage には一切触れない
- **進捗**: `lib/progress.ts` + React Context (`components/ProgressProvider.tsx`) — Phase 0 は認証・DB なし
- **用語集**: `lib/glossary.ts` + `app/glossary/page.tsx` + `components/TermText.tsx`（本文中の用語自動リンク）

## 開発

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # 本番ビルド
```

## ロードマップ

- Module 05 — ブラウザと DOM（sandbox iframe プレビュー実行）
- Module 06 — TypeScript / Module 07 — React・Next.js
- Phase 1 — AI チューター（Anthropic API / 修正コードは渡さず考え方を導く）

## ライセンス

MIT
