"use client";

// 「続きから」。まだクリアしていない最初のレッスンへ飛ぶ。
// 進捗は localStorage にあるためクライアント側でしか分からず、
// 読み込み前は「学習を始める」を出しておく（表示がガタつかないように）。

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { lessons } from "@/lib/lessons";
import { useProgress } from "@/components/ProgressProvider";

export function ResumeButton() {
  const { loaded, completed } = useProgress();

  const next = lessons.find((l) => !completed.includes(l.id)) ?? lessons[0];
  const started = loaded && completed.length > 0;

  return (
    <Link
      href={`/lessons/${started ? next.id : lessons[0].id}`}
      className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
    >
      {started
        ? `続きから — ${next.title}`.slice(0, 28)
        : "学習を始める"}{" "}
      <ArrowRight size={17} />
    </Link>
  );
}
