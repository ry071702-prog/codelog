"use client";

// DOM レッスンのプレビュー画面。
// sandbox iframe の中でユーザーのコードを本当に実行するので、ボタンのクリックなどもそのまま動く。
// 実行結果（console.log）と画面の状態（innerHTML）は postMessage で親に届き、クリア判定に使われる。
//
// srcDoc は親（LessonContent）が「実行を押した瞬間のコード」で組み立てて渡す。
// ここで作らないのは、編集のたびにプレビューが走り出さないようにするため。

import { useEffect, useRef } from "react";
import { Monitor } from "lucide-react";
import type { PreviewMessage } from "@/lib/domRunner";
import type { Log } from "@/lib/lessons";

interface DomPreviewProps {
  /** 0 = 未実行。実行のたびに +1 され、その値で iframe を作り直す */
  runId: number;
  srcDoc: string;
  onLog: (log: Log) => void;
  onDom: (html: string) => void;
  onDone: () => void;
}

export function DomPreview({
  runId,
  srcDoc,
  onLog,
  onDom,
  onDone,
}: DomPreviewProps) {
  // メッセージは実行完了後もずっと届く（クリックなど）。
  // 最新のコールバックを ref に写しておき、古い関数を掴んだままにしない。
  const handlers = useRef({ onLog, onDom, onDone });
  useEffect(() => {
    handlers.current = { onLog, onDom, onDone };
  });

  useEffect(() => {
    const onMessage = (e: MessageEvent<PreviewMessage>) => {
      const msg = e.data;
      if (!msg || msg.source !== "codelog-preview" || msg.runId !== runId) return;
      if (msg.type === "dom") {
        handlers.current.onDom(msg.html ?? "");
      } else if (msg.type === "done") {
        handlers.current.onDone();
      } else {
        handlers.current.onLog({ type: msg.type, text: msg.text ?? "" });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [runId]);

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-[7px] text-[13px] font-semibold text-sub">
        <Monitor size={15} /> プレビュー
        {runId > 0 && (
          <span className="text-[12px] font-normal text-faint">
            — 実際に触れる。ボタンや入力も動く
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        {runId === 0 ? (
          <div className="flex h-[180px] items-center justify-center px-4 text-center text-[13px] text-faint">
            ▶ 「実行する」を押すと、ここに画面が出るよ
          </div>
        ) : (
          <iframe
            key={runId}
            title="プレビュー"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="h-[240px] w-full border-none bg-white"
          />
        )}
      </div>
    </div>
  );
}
