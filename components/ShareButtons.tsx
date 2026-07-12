"use client";

// 修了シェア。モジュールを完走したとき・全レッスンを終えたときに出す。
// 学習の区切りを人に見せられるようにするための、小さなご褒美。

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

interface ShareButtonsProps {
  /** シェア文（X に流れる本文） */
  text: string;
  /** シェアする URL。省略時は今いるページ */
  url?: string;
}

export function ShareButtons({ text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");

  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(shareUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードが使えない環境では何もしない
    }
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-[9px] border border-line bg-card px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-accent hover:text-accent"
      >
        <Share2 size={15} /> X でシェア
      </a>
      <button
        type="button"
        onClick={copy}
        className="flex items-center gap-1.5 rounded-[9px] border border-line bg-card px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? <Check size={15} className="text-ok" /> : <Link2 size={15} />}
        {copied ? "コピーした" : "リンクをコピー"}
      </button>
    </div>
  );
}
