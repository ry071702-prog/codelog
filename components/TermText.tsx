"use client";

// レッスン本文中の専門用語を自動検出し、タップでポップアップ定義を出す。
// 読む流れを止めないため、その場で一行定義 → 詳細は用語集ページへ。

import { useMemo, useState } from "react";
import Link from "next/link";
import { glossary, type GlossaryTerm } from "@/lib/glossary";

interface Matcher {
  pattern: string;
  term: GlossaryTerm;
}

// 長い表記から先に照合する（「テンプレートリテラル」が「リテラル」より優先、など）
const matchers: Matcher[] = glossary
  .flatMap((t) =>
    [t.term, ...(t.aliases ?? [])].map((pattern) => ({ pattern, term: t }))
  )
  .filter((m) => m.pattern.length >= 2)
  .sort((a, b) => b.pattern.length - a.pattern.length);

const isWordChar = (ch: string | undefined) => !!ch && /[A-Za-z0-9_]/.test(ch);

interface Segment {
  text: string;
  term?: GlossaryTerm;
}

// 1つの用語につき段落内の最初の1回だけリンク化する（リンクだらけ防止）
function segmentText(text: string): Segment[] {
  const found: { start: number; end: number; term: GlossaryTerm }[] = [];
  const usedSlugs = new Set<string>();

  for (const { pattern, term } of matchers) {
    if (usedSlugs.has(term.slug)) continue;
    let from = 0;
    while (from < text.length) {
      const idx = text.indexOf(pattern, from);
      if (idx === -1) break;
      const end = idx + pattern.length;
      // 英字の用語は単語境界を要求する（"for" が "forEach" に反応しないように）
      const latin = /^[\x20-\x7e]+$/.test(pattern);
      const boundaryOk =
        !latin || (!isWordChar(text[idx - 1]) && !isWordChar(text[end]));
      const overlaps = found.some((f) => idx < f.end && end > f.start);
      if (boundaryOk && !overlaps) {
        found.push({ start: idx, end, term });
        usedSlugs.add(term.slug);
        break;
      }
      from = idx + 1;
    }
  }

  found.sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let pos = 0;
  for (const f of found) {
    if (f.start > pos) segments.push({ text: text.slice(pos, f.start) });
    segments.push({ text: text.slice(f.start, f.end), term: f.term });
    pos = f.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) });
  return segments;
}

function TermChip({ text, term }: { text: string; term: GlossaryTerm }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer underline decoration-accent/50 decoration-dotted underline-offset-4 transition-colors hover:text-accent"
      >
        {text}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="定義を閉じる"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <span className="absolute left-0 top-full z-40 mt-1.5 block w-72 max-w-[78vw] rounded-xl border border-line bg-card p-3.5 text-left shadow-[0_8px_30px_rgba(20,24,34,0.12)]">
            <span className="block text-sm font-bold text-ink">
              {term.term}
              {term.reading && (
                <span className="ml-1.5 text-xs font-normal text-faint">
                  （{term.reading}）
                </span>
              )}
            </span>
            <span className="mt-1 block text-[13px] leading-relaxed text-sub">
              {term.oneLiner}
            </span>
            <Link
              href={`/glossary#${term.slug}`}
              onClick={() => setOpen(false)}
              className="mt-2 inline-block text-[12.5px] font-semibold text-accent"
            >
              用語集で詳しく →
            </Link>
          </span>
        </>
      )}
    </span>
  );
}

export function TermText({ text }: { text: string }) {
  const segments = useMemo(() => segmentText(text), [text]);
  return (
    <>
      {segments.map((s, i) =>
        s.term ? (
          <TermChip key={i} text={s.text} term={s.term} />
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </>
  );
}
