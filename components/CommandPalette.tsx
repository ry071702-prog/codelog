"use client";

// Cmd+K（Ctrl+K）で開く横断検索。
// レッスンと用語をまとめて探せる。68レッスン・146語に育ったので、
// 「あれどこだっけ」を数秒で解決できることが体験の質に直結する。

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookA, GraduationCap, Search } from "lucide-react";
import { lessons } from "@/lib/lessons";
import { glossary } from "@/lib/glossary";

interface Hit {
  kind: "lesson" | "term";
  id: string;
  title: string;
  sub: string;
  href: string;
}

const ALL: Hit[] = [
  ...lessons.map((l) => ({
    kind: "lesson" as const,
    id: l.id,
    title: l.title,
    sub: l.module,
    href: `/lessons/${l.id}`,
  })),
  ...glossary.map((t) => ({
    kind: "term" as const,
    id: t.slug,
    title: t.term,
    sub: t.oneLiner,
    href: `/glossary?q=${encodeURIComponent(t.term)}`,
  })),
];

function search(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL.slice(0, 8);
  return ALL.filter(
    (h) =>
      h.title.toLowerCase().includes(q) ||
      h.sub.toLowerCase().includes(q) ||
      h.id.toLowerCase().includes(q)
  ).slice(0, 12);
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => search(query), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setActive(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const go = (hit: Hit) => {
    setOpen(false);
    router.push(hit.href);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 px-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <Search size={17} className="shrink-0 text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="レッスン・用語を検索（例: useState、非同期、push）"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
          />
          <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">
            esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto py-1.5">
          {hits.length === 0 && (
            <div className="px-4 py-6 text-center text-[13.5px] text-faint">
              見つかりませんでした
            </div>
          )}
          {hits.map((hit, i) => (
            <button
              key={`${hit.kind}-${hit.id}`}
              type="button"
              onClick={() => go(hit)}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-start gap-3 px-4 py-2.5 text-left ${
                i === active ? "bg-accent-soft" : ""
              }`}
            >
              {hit.kind === "lesson" ? (
                <GraduationCap size={16} className="mt-0.5 shrink-0 text-accent" />
              ) : (
                <BookA size={16} className="mt-0.5 shrink-0 text-faint" />
              )}
              <span className="min-w-0">
                <span className="block text-[14.5px] font-semibold text-ink">
                  {hit.title}
                </span>
                <span className="block truncate text-[12.5px] text-sub">
                  {hit.sub}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
