import { Terminal } from "lucide-react";
import type { Log } from "@/lib/lessons";

interface ConsoleOutputProps {
  logs: Log[];
  ran: boolean;
}

export function ConsoleOutput({ logs, ran }: ConsoleOutputProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-[7px] text-[13px] font-semibold text-sub">
        <Terminal size={15} /> 実行結果
      </div>
      <div className="min-h-[70px] rounded-xl bg-console px-4 py-3.5 font-mono text-sm leading-relaxed">
        {!ran && (
          <div className="text-[#8b93ad]">
            ▶ 「実行する」を押すと、ここに結果が出るよ
          </div>
        )}
        {ran && logs.length === 0 && (
          <div className="text-[#8b93ad]">
            （出力なし）console.log で何か出してみよう
          </div>
        )}
        {logs.map((l, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-words ${
              l.type === "error"
                ? "text-[#ff7b7b]"
                : l.type === "warn"
                  ? "text-[#ffcf70]"
                  : "text-[#d5dbec]"
            }`}
          >
            {l.type === "error" ? "⚠ " : ""}
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
