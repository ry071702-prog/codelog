// Worker 実行エンジンのクライアント側。
// 実行のたびに Worker を新規生成する使い捨て方式（状態を持ち越さない）。
// 3 秒でタイムアウトして terminate する。

import type { Log } from "@/lib/lessons";

const TIMEOUT_MS = 3000;

interface WorkerMessage {
  type: "log" | "warn" | "error" | "done";
  text?: string;
}

export function runCode(code: string): Promise<Log[]> {
  return new Promise((resolve) => {
    const worker = new Worker("/worker/runner.js");
    const logs: Log[] = [];

    const finish = () => {
      worker.terminate();
      resolve(logs);
    };

    const timer = setTimeout(() => {
      logs.push({
        type: "error",
        text: "実行時間が長すぎます（無限ループかも）。3秒で停止しました。",
      });
      finish();
    }, TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;
      if (msg.type === "done") {
        clearTimeout(timer);
        finish();
      } else {
        logs.push({ type: msg.type, text: msg.text ?? "" });
      }
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      logs.push({ type: "error", text: e.message || "実行エラー" });
      finish();
    };

    worker.postMessage({ code });
  });
}
