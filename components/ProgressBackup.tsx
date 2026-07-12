"use client";

// 進捗のバックアップと引き継ぎ。
// codelog の進捗はこのブラウザの localStorage にしか無いため、
// 端末を変えると消える。JSON として書き出し／読み込みできるようにしておく。

import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { lessons } from "@/lib/lessons";
import { useProgress } from "@/components/ProgressProvider";

const KEYS = [
  "codelog:completed",
  "codelog:code",
  "codelog:checks",
  "codelog:preview-store",
];

export function ProgressBackup() {
  const { loaded, completed } = useProgress();
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const exportProgress = () => {
    const data: Record<string, unknown> = { version: 1, exportedAt: new Date().toISOString() };
    for (const key of KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) data[key] = JSON.parse(raw);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codelog-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("進捗ファイルを書き出しました");
  };

  const importProgress = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object") throw new Error("形式が違う");
      const data = parsed as Record<string, unknown>;
      let restored = 0;
      for (const key of KEYS) {
        if (key in data) {
          localStorage.setItem(key, JSON.stringify(data[key]));
          restored += 1;
        }
      }
      if (restored === 0) throw new Error("進捗データが入っていない");
      setMessage("読み込みました。ページを更新します…");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setMessage("読み込めませんでした。codelog から書き出したファイルを選んでね");
    }
  };

  const resetProgress = () => {
    if (!window.confirm("進捗と書きかけのコードを全部消します。よろしいですか?")) {
      return;
    }
    for (const key of KEYS) localStorage.removeItem(key);
    window.location.reload();
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="text-[15px] font-bold text-ink">進捗のバックアップ</div>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-sub">
        進捗はこのブラウザの中だけに保存されています（アカウント不要のかわりに、
        端末を変えると引き継げません）。書き出したファイルを別の端末で読み込めば、
        続きから学べます。
      </p>
      <p className="mt-3 text-[13.5px] text-sub">
        いまの進捗:{" "}
        <span className="font-bold text-accent">
          {loaded ? completed.length : "…"} / {lessons.length}
        </span>{" "}
        レッスン
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={exportProgress}
          className="flex items-center gap-1.5 rounded-[9px] bg-accent px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Download size={15} /> 書き出す
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-1.5 rounded-[9px] border border-line bg-card px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <Upload size={15} /> 読み込む
        </button>
        <button
          type="button"
          onClick={resetProgress}
          className="flex items-center gap-1.5 rounded-[9px] border border-line bg-card px-4 py-2 text-sm font-bold text-sub transition-colors hover:border-err hover:text-err"
        >
          <RotateCcw size={15} /> 全部リセット
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importProgress(file);
            e.target.value = "";
          }}
        />
      </div>

      {message && (
        <div className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-[13px] text-accent">
          {message}
        </div>
      )}
    </div>
  );
}
