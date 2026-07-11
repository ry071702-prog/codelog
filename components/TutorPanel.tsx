"use client";

// AI チューター (Phase 1)。
// 詰まったらその場で質問できる。コードと実行結果はリクエストに自動で添付されるので
// 学習者は状況説明ゼロで質問できる。
// レート制限は「同一クライアント 1日 N 回」の簡易実装 (localStorage)。

import { useEffect, useState } from "react";
import { GraduationCap, Send } from "lucide-react";
import type { Log } from "@/lib/lessons";

const DAILY_LIMIT = 10;
const USAGE_KEY = "codelog:tutor-usage";

interface TutorMessage {
  role: "user" | "assistant";
  text: string;
}

function readUsage(): { date: string; count: number } {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed as { date?: unknown }).date === today &&
        typeof (parsed as { count?: unknown }).count === "number"
      ) {
        return { date: today, count: (parsed as { count: number }).count };
      }
    }
  } catch {
    // 壊れたデータは無視してリセット
  }
  return { date: today, count: 0 };
}

function incrementUsage(): number {
  const usage = readUsage();
  const next = { ...usage, count: usage.count + 1 };
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(next));
  } catch {
    // 保存できない環境では制限なしで動く (簡易実装)
  }
  return next.count;
}

interface TutorPanelProps {
  lessonId: string;
  code: string;
  logs: Log[];
}

export function TutorPanel({ lessonId, code, logs }: TutorPanelProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    // localStorage は SSR に無いため hydration 後に読む (初期 state で読むと描画がズレる)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(DAILY_LIMIT - readUsage().count);
  }, []);

  const ask = async () => {
    const q = question.trim();
    if (!q || loading) return;
    if (readUsage().count >= DAILY_LIMIT) {
      setError(`今日の質問回数の上限 (${DAILY_LIMIT}回) に達しました。また明日どうぞ`);
      return;
    }

    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, code, logs, question: q }),
      });
      const data: { answer?: string; error?: string } = await res.json();
      if (!res.ok || !data.answer) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer! }]);
      const count = incrementUsage();
      setRemaining(DAILY_LIMIT - count);
    } catch {
      setError("通信に失敗しました。ネットワークを確認してもう一度どうぞ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-[22px] rounded-[14px] border border-line bg-card px-[18px] py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <GraduationCap size={16} className="text-accent" />
          AIチューターに質問する
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">
            β
          </span>
        </div>
        {remaining !== null && (
          <span className="text-[11.5px] text-faint">残り {Math.max(0, remaining)} 回 / 日</span>
        )}
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-sub">
        いま書いているコードと実行結果は自動で伝わるので、「なんでエラーになる?」だけでOK。答えは教えず、考え方をガイドします
      </p>

      {messages.length > 0 && (
        <div className="mt-3 flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                m.role === "user"
                  ? "self-end bg-accent-soft text-ink"
                  : "self-start border border-line bg-canvas text-[#3a4051]"
              } max-w-[92%] whitespace-pre-wrap`}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="self-start rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[13.5px] text-faint">
              考え中…
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-err/10 px-3 py-2 text-[12.5px] text-err">
          {error}
        </div>
      )}

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              ask();
            }
          }}
          placeholder="例: 実行してもクリアにならないのはなんで?"
          rows={2}
          maxLength={500}
          className="min-h-[44px] w-full resize-y rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-faint focus:border-accent"
        />
        <button
          type="button"
          onClick={ask}
          disabled={loading || question.trim().length === 0}
          aria-label="質問を送る"
          className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-accent text-white ${
            loading || question.trim().length === 0
              ? "cursor-default opacity-40"
              : "cursor-pointer hover:opacity-90"
          }`}
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
