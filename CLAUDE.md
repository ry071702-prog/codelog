# CLAUDE.md — codelog

## プロジェクト概要

codelog は「読む → 動かす → 書く」で学ぶ、ブラウザ内コード実行つきの JavaScript 学習サイト。誰でも無料で使える公開サイトとして運用し、将来的に AI チューターを組み込む。

- オーナー: りーたん（プログラミング学習中。JS 基礎 = codelog Module 01–02 を並行学習中）
- 目的（優先順）: ① オーナー自身の学習 ② ポートフォリオ ③ 誰でも学べる公開サイト
- 既存資産: プロトタイプ `codelog.jsx`（React 単一ファイル）。26レッスン（全4モジュール）・コードエディタ・実行エンジン・クリア判定・進捗保存を実装済み。**機能と文言はこのプロトタイプが正**。Phase 0 はこれの Next.js 移植。

## 着工前チェックリスト

- [ ] GitHub アカウント / Vercel アカウント（GitHub 連携でサインアップ）
- [ ] Node.js 18 以上（`node -v` で確認。Claude Code が動く環境なら入っているはず）
- [ ] GitHub でリポジトリ `codelog` を作成（**public 推奨**: ポートフォリオとしてコードごと見せられる。ライセンスは MIT）
- [ ] リポジトリ直下にこの `CLAUDE.md` とプロトタイプ `codelog.jsx` を置く

準備ができたら、Claude Code に最初に投げるプロンプト:

> CLAUDE.md を読んで。今日は Step 1 をやりたい。チューターモードで、最初に今日のゴールと流れを説明してから進めて。

## ⚠️ 最重要: このプロジェクトでの Claude の振る舞い（チューターモード）

このプロジェクトは学習が主目的。**Claude が全部書いたら、このプロジェクトは失敗**。

1. 各ステップの冒頭で「これから何を・なぜやるか」を 3〜5 行で説明してから着手する
2. 「✍️ 自分で書く」と指定された箇所は、Claude はコードを書かない。TODO コメント + ヒントで止めて、オーナーが書いたものをレビューし、改善点を伝える
3. エラーが出ても即修正しない。まずエラーメッセージの読み方と原因の考え方を説明し、オーナーに直させる。2回詰まったら答えを見せてよい
4. 専門用語は初出時に一行で注釈を入れる
5. 1 ステップ = 1 コミット。コミットメッセージは「何をしたか + 何を学んだか」の学習ログとして書く
6. オーナーが「急ぎで」と明示した場合のみ、通常モード（Claude が全部書く）に切り替え

## 技術スタックと決定事項

- **Next.js (App Router) + TypeScript + Tailwind CSS**、デプロイは **Vercel**（push で自動デプロイ）
- 見た目はプロトタイプを正とし、Tailwind で再現する。プロトの色定数（`C` オブジェクト）は Tailwind の theme に登録して使う
- レッスンデータ: `lib/lessons.ts`。**check 関数を含むため JSON ではなく TS モジュール**
- 進捗: `localStorage`（Phase 0 では認証・DB なし）
- コード実行: **Web Worker 方式**（下記参照）。ページ内での `new Function` 実行は禁止
- AI（Phase 1）: Next.js API Route 経由で Anthropic API。**API キーはサーバー側環境変数のみ。クライアントに露出させたら即アウト**
- 型は最初から完璧を求めない。Step 1–7 は `any` 許容、Step 8 で撲滅する
- パッケージマネージャは **npm** に統一（pnpm / yarn は使わない。手順の混乱を避ける）
- Vercel Analytics などの計測は Phase 0 では入れない（公開後に検討）

## ディレクトリ構成（Phase 0 の目標形）

```
codelog/
├── CLAUDE.md
├── app/
│   ├── layout.tsx              # 共通レイアウト（サイドバー）
│   ├── page.tsx                # トップ → 最初のレッスンへ誘導
│   ├── lessons/[id]/page.tsx   # レッスン画面（動的ルート）
│   └── glossary/page.tsx       # 用語集（検索・カテゴリ絞り込み）
├── components/
│   ├── Sidebar.tsx
│   ├── StepItem.tsx
│   ├── LessonContent.tsx
│   ├── CodeEditor.tsx
│   └── ConsoleOutput.tsx
├── lib/
│   ├── lessons.ts              # 全レッスンデータ（プロトから移植）
│   ├── glossary.ts             # 用語集データ（用語/読み/定義/コード例/関連レッスン）
│   ├── runner.ts               # Worker 実行エンジンのクライアント側
│   └── progress.ts             # localStorage 進捗の save / load
└── public/worker/runner.js     # 実行用 Worker 本体
```

## コード実行エンジンの設計（公開の必須条件）

**なぜ**: 公開サイトで任意のユーザーコードをページの JS コンテキストで実行してはいけない。`while(true)` 一発でタブが凍るし、将来コード共有機能を足したときに攻撃の土壌になる。

**Web Worker 方式にする理由**: 別スレッドで実行されるため無限ループでも UI が固まらず、`worker.terminate()` で強制停止できる。ページの DOM・storage には一切触れない。

仕様:
- `lib/runner.ts`: 実行のたびに Worker を新規生成（状態を持ち越さない使い捨て）。`{ code }` を postMessage し、`{ type: 'log' | 'warn' | 'error' | 'done', text }` を受信して UI へ渡す。**3 秒でタイムアウト** → terminate して「実行時間が長すぎます（無限ループかも）」と表示
- `public/worker/runner.js`: console を postMessage 化した代理に差し替え、擬似 API `fetchUsers` / `fetchPosts` を定義し、async IIFE でユーザーコードを実行（Worker 内なので隔離済み）。完了時に `done` を送る
- プロトタイプの `runCode` のロジック（formatArg、エラー捕捉、擬似 API）を Worker 側へ移す

将来（Module 03: DOM 編）は sandbox 属性つき iframe のプレビューを別途追加する。Phase 0 ではやらない。

## Phase 0 — ビルドカリキュラム（1 ステップ = 1 概念）

各ステップ: やること / 学ぶこと / ✍️ オーナーが自分で書く箇所

**Step 1: Hello, deploy**
- create-next-app（TS + Tailwind + App Router）→ GitHub リポジトリ作成 → Vercel 連携。トップページの文言を書き換えて push、再デプロイを確認
- create-next-app の対話式の質問への回答（ここで詰まりやすい）:
  - TypeScript / ESLint / Tailwind CSS → すべて **Yes**
  - `src/` directory → **No**（本ドキュメントのディレクトリ構成に合わせる）
  - App Router → **Yes**
  - import alias → デフォルトのまま Enter
  - バージョンによって増えるその他の質問はデフォルトで OK
- 学ぶ: プロジェクト構造、push → 自動デプロイの流れ
- ✍️: `page.tsx` の文言変更（記念すべき初コミット）
- ゴール: **自分のサイトの URL がインターネット上に存在する**

**Step 2: コンポーネント分割**
- Sidebar / StepItem を静的データで作る
- 学ぶ: コンポーネント、JSX、props
- ✍️: StepItem の props（title / done / active）の設計と渡し方

**Step 3: レッスンデータと動的ルート**
- `lib/lessons.ts` にプロトの全 26 レッスンを移植し、`app/lessons/[id]/page.tsx` で表示
- 学ぶ: 動的ルーティング、map によるリスト描画、Server / Client Component の境界（`"use client"` をどこに貼るか・なぜか）
- ✍️: サイドバーの `lessons.map(...)` 部分

**Step 4: エディタと state**
- CodeEditor / ConsoleOutput を移植
- 学ぶ: useState、制御された textarea、イベントハンドラ
- ✍️: onChange とリセットボタンの処理

**Step 5: 実行エンジン（Worker）**
- `runner.ts` + `worker/runner.js` を実装し、実行ボタンに接続
- 学ぶ: Worker と非同期メッセージング、なぜ隔離が必要か
- ✍️: タイムアウト（3 秒で terminate）の部分

**Step 6: 進捗とクリア判定**
- check 関数によるクリア判定、localStorage への保存・復元
- 学ぶ: useEffect、永続化、JSON.stringify / parse
- ✍️: `lib/progress.ts` の save / load

**Step 6.5: 用語集（専門用語を調べる・確認する）**
- `lib/glossary.ts` に用語データ（用語 / 読み / カテゴリ / 一行定義 / 詳しい説明 / コード例 / 関連レッスンID）を定義し、`app/glossary/page.tsx` で一覧表示（検索・カテゴリ絞り込み）
- レッスン本文中の専門用語はタップでその場にポップアップ定義を表示（読む流れを止めない）。詳細は用語集ページへリンク
- 学ぶ: 検索フィルタ（filter / includes の実戦投入 = M2〜M3 の復習）、コンポーネントの再利用
- ✍️: 検索の filter 部分

**Step 7: 公開仕上げ**
- metadata（タイトル・description・OGP）、モバイル表示確認、README 執筆
- 学ぶ: Next.js metadata API
- ✍️: README（このサイトの紹介文 = ポートフォリオの顔）

**Step 8: 型の仕上げ（any 撲滅）**
- `Lesson` 型・`Log` 型などを定義し、any を消していく
- 学ぶ: interface / type、型エラーの読み方
- ✍️: `Lesson` 型の定義

## Phase 0 完了の定義（これが全部 ✓ なら公開完了）

- [ ] 26 レッスンすべてが公開 URL 上で表示・実行できる
- [ ] 用語集ページで専門用語を検索でき、レッスン本文中の用語タップで定義が出る
- [ ] `while (true) {}` を実行してもページが固まらず、3 秒で停止メッセージが出る
- [ ] レッスンをクリアしてリロードしても進捗が残っている
- [ ] スマホ表示でエディタと実行が使える
- [ ] README にサイト概要・技術構成・自分が書いた部分の説明がある

## Phase 1（公開後）— AI チューター

- `app/api/tutor/route.ts` を作成。リクエスト = `{ lessonId, code, logs }`。サーバー側でレッスン本文と結合してプロンプトを構築（ユーザーは説明ゼロで質問できる）
- システムプロンプト方針: **修正済みコードを渡さない**。見るべき行と考え方を導く。回答は日本語
- モデルは軽量なもの + max_tokens 制限。レート制限は同一クライアント 1 日 N 回の簡易実装でよい（厳密な制限は認証導入後の課題と割り切る）
- その後: Supabase（Auth + 進捗 DB）、クリア画面のシェア用 OGP

## やらないこと（Phase 0 の Non-Goals）

- 認証・DB — localStorage で足りる。早すぎる導入は複雑さだけ増える
- コメント・コード共有機能 — 他人のコードを表示する機能はセキュリティ設計を伴うため Phase 2 以降
- 課金 — 目的は学習とポートフォリオ
- SEO の作り込み・独自ドメイン — 動くものが先。ドメインは任意
- 全画面の Tailwind 完全最適化 — 見た目の再現度よりステップ完走を優先

## 参照

- `codelog.jsx` — プロトタイプ。レッスン文言・check 関数・UI 仕様の正。移植時はここから写す
