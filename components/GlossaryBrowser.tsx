"use client";

// 用語集ページ本体。検索 + カテゴリ絞り込み。
// filter / includes によるクライアントサイド検索（M2〜M3 の内容の実戦投入）。

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import {
  glossary,
  glossaryCategories,
  type GlossaryCategory,
} from "@/lib/glossary";
import { getLesson } from "@/lib/lessons";

type CategoryFilter = GlossaryCategory | "すべて";

export function GlossaryBrowser() {
  // 検索パレット（Cmd+K）から /glossary?q=用語 で飛んでくる
  const initialQuery = useSearchParams().get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryFilter>("すべて");

  const q = query.trim().toLowerCase();
  const filtered = glossary.filter((t) => {
    const matchesCategory = category === "すべて" || t.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    const haystack = [
      t.term,
      t.reading ?? "",
      t.oneLiner,
      t.description,
      ...(t.aliases ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[760px] px-6 pb-20 pt-10">
        <Link
          href="/"
          className="flex w-fit items-center gap-1.5 text-[13.5px] font-semibold text-sub transition-colors hover:text-accent"
        >
          <ArrowLeft size={15} /> トップへ
        </Link>

        <div className="mt-6 flex items-baseline gap-2">
          <h1 className="text-[27px] font-extrabold tracking-tight text-ink">
            用語集
          </h1>
          <span className="font-mono text-sm text-faint">
            {glossary.length} terms
          </span>
        </div>
        <p className="mt-2 text-[14.5px] leading-relaxed text-sub">
          レッスンに出てくる専門用語を調べる・確認する。レッスン本文中の点線つき用語をタップしても、ここに飛べる。
        </p>

        <div className="sticky top-0 z-10 -mx-2 mt-6 bg-canvas px-2 pb-3 pt-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-3">
            <Search size={17} className="shrink-0 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="用語・読み・説明で検索（例: 配列 / async / こうかい）"
              className="w-full border-none bg-transparent text-[14.5px] text-ink outline-none placeholder:text-faint"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["すべて", ...glossaryCategories] as CategoryFilter[]).map(
              (c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors ${
                    category === c
                      ? "bg-accent text-white"
                      : "border border-line bg-card text-sub hover:border-accent hover:text-accent"
                  }`}
                >
                  {c}
                </button>
              )
            )}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 text-center text-[14.5px] text-sub">
            「{query}」に当てはまる用語が見つからない。別の言葉で試してみて。
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4">
          {filtered.map((t) => (
            <section
              key={t.slug}
              id={t.slug}
              className="scroll-mt-36 rounded-2xl border border-line bg-card p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <h2 className="text-[17px] font-extrabold text-ink">
                  {t.term}
                </h2>
                {t.reading && (
                  <span className="text-[12.5px] text-faint">{t.reading}</span>
                )}
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold text-accent">
                  {t.category}
                </span>
              </div>
              <p className="mt-2 text-[14.5px] font-semibold leading-relaxed text-ink">
                {t.oneLiner}
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.85] text-sub">
                {t.description}
              </p>
              {t.example && (
                <pre className="mt-3 overflow-x-auto rounded-xl bg-editor px-4 py-3 font-mono text-[13px] leading-relaxed text-editor-ink">
                  {t.example}
                </pre>
              )}
              {t.lessonIds && t.lessonIds.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-bold text-faint">
                    関連レッスン:
                  </span>
                  {t.lessonIds.map((id) => {
                    const lesson = getLesson(id);
                    if (!lesson) return null;
                    return (
                      <Link
                        key={id}
                        href={`/lessons/${id}`}
                        className="rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-sub transition-colors hover:border-accent hover:text-accent"
                      >
                        {lesson.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
