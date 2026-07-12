"use client";

// コードエディタ。
// textarea（実際の入力）の上に、色をつけた <pre> をぴったり重ねて
// シンタックスハイライトを実現している（textarea の文字自体は透明にして、
// カーソルと選択範囲だけを見せる）。両者のフォント・行間・余白は必ず揃えること。

import { Play, RotateCcw } from "lucide-react";
import { TOKEN_COLOR, tokenize } from "@/lib/highlight";

interface CodeEditorProps {
  value: string;
  /** タブに出すファイル名。TS レッスンでは script.ts になる */
  fileName?: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  running: boolean;
}

// textarea と pre で完全に一致させる必要があるスタイル
const TEXT_STYLE =
  "px-[18px] py-4 font-mono text-[14.5px] leading-relaxed [tab-size:2] whitespace-pre-wrap break-words";

export function CodeEditor({
  value,
  fileName = "script.js",
  onChange,
  onRun,
  onReset,
  running,
}: CodeEditorProps) {
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const s = el.selectionStart;
      const en = el.selectionEnd;
      onChange(value.slice(0, s) + "  " + value.slice(en));
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
    }
  };

  return (
    <div className="overflow-hidden rounded-[14px] bg-editor">
      <div className="flex items-center justify-between border-b border-editor-line px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-xs text-[#6b7392]">
            {fileName}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          title="最初のコードに戻す"
          className="flex items-center gap-1.5 text-xs text-[#6b7392] transition-colors hover:text-editor-ink"
        >
          <RotateCcw size={13} /> リセット
        </button>
      </div>

      {/* 色つきレイヤー（pre）が高さを決め、textarea をその上に重ねる。
          こうするとコードの行数に合わせてエディタが自然に伸びる。 */}
      <div className="relative">
        <pre
          aria-hidden="true"
          className={`min-h-[190px] ${TEXT_STYLE}`}
        >
          {tokenize(value).map((t, i) => (
            <span key={i} className={TOKEN_COLOR[t.type]}>
              {t.text}
            </span>
          ))}
          {/* 末尾が改行のとき、最終行の高さを確保する */}
          {"\n"}
        </pre>
        <textarea
          value={value}
          aria-label="コードエディタ"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          className={`absolute inset-0 h-full w-full resize-none overflow-hidden border-none bg-transparent text-transparent caret-white outline-none selection:bg-[#4b54e8]/40 ${TEXT_STYLE}`}
        />
      </div>

      <div className="flex justify-end border-t border-editor-line px-3.5 py-3">
        <button
          type="button"
          onClick={onRun}
          disabled={running}
          className={`flex items-center gap-[7px] rounded-[10px] bg-accent px-[18px] py-[9px] text-[14.5px] font-bold text-white ${
            running ? "cursor-default opacity-60" : "cursor-pointer"
          }`}
        >
          <Play size={15} fill="#fff" /> {running ? "実行中…" : "実行する"}
        </button>
      </div>
    </div>
  );
}
