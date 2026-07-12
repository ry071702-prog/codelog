"use client";

import { Fragment } from "react";
import Link from "next/link";
import { BookA, Lock, Settings } from "lucide-react";
import { lessons, roadmap } from "@/lib/lessons";
import { useProgress } from "@/components/ProgressProvider";
import { StepItem } from "@/components/StepItem";

interface SidebarProps {
  currentId?: string;
  onNavigate?: () => void;
}

export function Sidebar({ currentId, onNavigate }: SidebarProps) {
  const { completed } = useProgress();
  const doneCount = completed.length;
  const pct = Math.round((doneCount / lessons.length) * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-[22px]">
        <Link href="/" onClick={onNavigate} className="flex items-baseline gap-1.5">
          <span className="font-mono text-[21px] font-extrabold tracking-tight text-ink">
            codelog
          </span>
          <span className="font-mono text-[11px] text-faint">()</span>
        </Link>
        <div className="mt-1 text-[12.5px] leading-normal text-sub">
          JavaScript を、基礎から本格的に
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-sub">
            <span>進捗</span>
            <span className="font-bold text-accent">
              {doneCount} / {lessons.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-400 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <Link
          href="/glossary"
          onClick={onNavigate}
          className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-[13px] font-semibold text-sub transition-colors hover:border-accent hover:text-accent"
        >
          <BookA size={15} /> 用語集 — 専門用語を調べる
        </Link>
        <Link
          href="/settings"
          onClick={onNavigate}
          className="mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] text-faint transition-colors hover:text-accent"
        >
          <Settings size={14} /> 進捗のバックアップ
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {lessons.map((l, i) => {
          const showHeader = i === 0 || lessons[i - 1].module !== l.module;
          const isLast =
            i === lessons.length - 1 || lessons[i + 1].module !== l.module;
          return (
            <Fragment key={l.id}>
              {showHeader && (
                <div className="px-2 pb-2 pt-4 text-[11px] font-bold tracking-wider text-faint">
                  {l.module}
                </div>
              )}
              <StepItem
                index={i}
                id={l.id}
                title={l.title}
                active={l.id === currentId}
                done={completed.includes(l.id)}
                isLast={isLast}
                onNavigate={onNavigate}
              />
            </Fragment>
          );
        })}
        {roadmap.length > 0 && (
          <div className="px-2 pb-2 pt-5 text-[11px] font-bold tracking-wider text-faint">
            これから
          </div>
        )}
        {roadmap.map((r) => (
          <div
            key={r}
            className="flex items-center gap-3 px-2 py-[7px] text-[13.5px] text-faint"
          >
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line">
              <Lock size={12} />
            </span>
            {r}
          </div>
        ))}
        <div className="h-4" />
      </div>
    </div>
  );
}
