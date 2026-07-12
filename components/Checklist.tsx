"use client";

// MODULE 08（個人開発の実践）用のチェックリスト。
// 自分のパソコンで手を動かす回は、コードエディタの代わりにこれを出す。
// 全部チェックするとクリアになる（チェック状態は localStorage に残る）。

import { Check, SquareCheck } from "lucide-react";

interface ChecklistProps {
  items: string[];
  checked: number[];
  onToggle: (index: number) => void;
}

export function Checklist({ items, checked, onToggle }: ChecklistProps) {
  const done = checked.length;

  return (
    <div className="rounded-[14px] border border-line bg-card px-[18px] py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <SquareCheck size={16} className="text-accent" />
          自分のパソコンでやること
        </div>
        <span className="text-[12px] text-faint">
          {done} / {items.length}
        </span>
      </div>

      <ul className="flex flex-col gap-1">
        {items.map((item, i) => {
          const isChecked = checked.includes(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onToggle(i)}
                className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-canvas"
              >
                <span
                  className={`mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-md border-2 ${
                    isChecked
                      ? "border-ok bg-ok text-white"
                      : "border-line bg-card text-transparent"
                  }`}
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <span
                  className={`text-[14.5px] leading-relaxed ${
                    isChecked ? "text-faint line-through" : "text-ink"
                  }`}
                >
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
