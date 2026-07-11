"use client";

import { Play, RotateCcw } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  running: boolean;
}

export function CodeEditor({
  value,
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
            script.js
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
      <textarea
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        className="min-h-[190px] w-full resize-y border-none bg-transparent px-[18px] py-4 font-mono text-[14.5px] leading-relaxed text-editor-ink outline-none [tab-size:2]"
      />
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
