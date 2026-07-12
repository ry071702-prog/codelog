# codelog()

読んで、動かして、書いて学ぶ JavaScript 学習サイト。

ブラウザの上でそのままコードを書いて実行できる。全9モジュール・75レッスンを順番に進めるだけで、変数からクラス・非同期処理、DOM、TypeScript、React まで——個人開発を始められるところまで進める。専門用語はレッスン本文中のタップでその場に定義が出て、用語集ページで検索もできる。

## 機能

- **75レッスン / 9モジュール** — 土台 → 一歩深く → データを自在に → 設計とモダンJS → ブラウザとDOM → TypeScript → React / Next.js → 個人開発の実践 → テストを書く。各レッスンは「読む → 例を読む → 自分で書く → 実行してクリア判定」の流れ
- **ブラウザ内コード実行** — Web Worker による隔離実行。無限ループを書いても UI は固まらず、3秒でタイムアウト停止する
- **DOM プレビュー** — MODULE 05 は sandbox iframe の中で本物の DOM を操作する。書いたコードでプレビューが動き、ボタンや入力もその場で触れる。実行前に Worker で試走して無限ループを弾く二段構え
- **クリア判定と進捗保存** — レッスンごとの check 関数で自動判定（DOM レッスンは画面の状態も見るので、ボタンを実際に押すとクリアになる）。進捗と書きかけコードは localStorage に保存され、リロードしても残る
- **用語集** — 150語超の専門用語（JS文法 / DOM・Web / Git・GitHub / 開発現場の言葉 / AI用語）を検索・カテゴリで絞り込み。レッスン本文中の用語はタップでポップアップ定義
- **AIチューター (β)** — 各レッスンでその場で質問できる。書いているコードと実行結果は自動で添付されるので説明不要。修正コードは渡さず、見るべき行と考え方を導く設計。クライアント 1日10回 + サーバー側 20回/時（同一IP）
- **卒業制作 (MODULE 08)** — 自分のパソコンで手を動かす回はチェックリスト型。企画を削る → データ設計 → 環境構築 → Git → MVP → 保存 → 環境変数 → Vercel デプロイ → 改善 → 卒業
- **進捗のバックアップ** — `/settings` で進捗を JSON に書き出し／別端末で読み込み（アカウント不要のため）
- **シェアと SEO** — モジュール完走時に X シェア。`next/og` でレッスンごとの OGP 画像を生成し、sitemap / robots も配信

## 技術構成

- **Next.js (App Router) + TypeScript + Tailwind CSS** — Vercel にデプロイ（push で自動デプロイ）
- **レッスンデータ**: `lib/lessons.ts` — クリア判定の check 関数を含むため JSON ではなく TS モジュール
- **実行エンジン (JS)**: `public/worker/runner.js` + `lib/runner.ts` — 実行のたびに Worker を使い捨てで生成し、`postMessage` でログを受け取る。ページの DOM・storage には一切触れない
- **実行エンジン (DOM)**: `lib/domRunner.ts` + `components/DomPreview.tsx` — `public/worker/dom-guard.js` で無限ループを試走チェックしたうえで、`sandbox="allow-scripts"` の iframe で本物の DOM を操作する。ログと画面（innerHTML）は `postMessage` で親に返り、クリア判定に使われる
- **実行エンジン (TypeScript)**: `lib/tsRunner.ts` + `public/worker/ts-runner.js` — ブラウザ内の本物の tsc で strict 型チェック。型エラーがあれば実行せず、日本語（TS 公式訳）で行番号つきに表示する
- **実行エンジン (React)**: `public/worker/jsx-compiler.js` で JSX を JavaScript に変換し、React を読み込んだプレビュー iframe で実行する
- **テストランナー (MODULE 09)**: `public/worker/runner.js` に `test` / `expect` を実装。Vitest とほぼ同じ書き味でブラウザ内でテストが走る（✓ / ✗ と理由が出る）
- **ベンダー資産**: `scripts/prepare-ts.mjs` が `node_modules` から TypeScript コンパイラ・型定義・React バンドルを `public/vendor/` に生成する（git 管理外。`prebuild` / `predev` で自動実行）
- **進捗**: `lib/progress.ts` + React Context (`components/ProgressProvider.tsx`) — Phase 0 は認証・DB なし
- **用語集**: `lib/glossary.ts` + `app/glossary/page.tsx` + `components/TermText.tsx`（本文中の用語自動リンク）
- **AIチューター**: `app/api/tutor/route.ts`（API Route + Anthropic API / claude-haiku-4-5）+ `components/TutorPanel.tsx`。API キーはサーバー側環境変数 `ANTHROPIC_API_KEY` のみで扱う

## 開発

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # 本番ビルド
npm test       # 全レッスンの模範解答がクリア判定されるかを検証（Vitest）
```

テストは `lib/solutions.ts` の模範解答を、本番と同じ手順（JS 実行 / TS 型チェック / JSX 変換 → jsdom で操作）で走らせ、各レッスンの `check` が本当に true を返すかを確かめる。レッスン文言・判定・実行エンジンのどれを直しても、壊れれば気づける。

AIチューターを動かすには `.env.local` に `ANTHROPIC_API_KEY=sk-ant-...` を設定する（本番は Vercel の Environment Variables に登録）。未設定でもサイト本体は動作し、チューターだけ「準備中」表示になる。

## この先の候補

- 進捗のアカウント同期（Supabase + GitHub ログイン）— 現状はブラウザ内保存 + 手動バックアップ
- レッスンの追加（テスト / データベース / 認証）

## ライセンス

MIT
