import Link from "next/link";
import { ArrowRight, BookA, Play, Route } from "lucide-react";
import { lessons } from "@/lib/lessons";
import { glossary } from "@/lib/glossary";

export default function Home() {
  const moduleCount = new Set(lessons.map((l) => l.module)).size;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-6 py-20">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            codelog
          </span>
          <span className="font-mono text-xl text-faint sm:text-2xl">()</span>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-[32px]">
          読んで、動かして、書いて学ぶ
          <br />
          JavaScript
        </h1>
        <p className="mt-4 max-w-[560px] text-[15.5px] leading-[1.85] text-sub">
          ブラウザの上でそのままコードを書いて実行できる、無料の JavaScript
          学習サイト。全{moduleCount}モジュール・{lessons.length}
          レッスンを順番に進めるだけで、変数から非同期処理、そして自分の手で動く画面を作るところまで進める。
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/lessons/${lessons[0].id}`}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
          >
            学習を始める <ArrowRight size={17} />
          </Link>
          <Link
            href="/glossary"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-card px-7 text-[15px] font-bold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <BookA size={17} /> 用語集を見る
          </Link>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-card p-5">
            <Play size={20} className="text-accent" />
            <div className="mt-3 text-[15px] font-bold text-ink">
              その場で実行
            </div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-sub">
              エディタに書いたコードをブラウザ内で安全に実行。DOM
              編では書いた瞬間に本物の画面が動き、ボタンや入力もその場で触れる。
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5">
            <Route size={20} className="text-accent" />
            <div className="mt-3 text-[15px] font-bold text-ink">
              体系的なカリキュラム
            </div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-sub">
              土台 → 一歩深く → データ処理 → 設計とモダンJS → ブラウザとDOM。
              {lessons.length}レッスンを積み上げ式で。進捗は自動保存。
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-5">
            <BookA size={20} className="text-accent" />
            <div className="mt-3 text-[15px] font-bold text-ink">
              用語集つき
            </div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-sub">
              {glossary.length}
              語の専門用語を検索して確認できる。レッスン本文の用語はタップでその場に定義が出る。
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-line py-6 text-center text-[12.5px] text-faint">
        <a
          href="https://github.com/ry071702-prog/codelog"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-accent"
        >
          GitHub — ry071702-prog/codelog
        </a>
      </footer>
    </div>
  );
}
