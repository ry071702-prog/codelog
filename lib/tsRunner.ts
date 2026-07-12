// TypeScript レッスンの実行エンジン（クライアント側）。
//
// Worker（public/worker/ts-runner.js）が「型チェック → 変換 → 実行」を担当する。
// タイムアウトは2段階に分けている:
//   - コンパイル中: 初回は typescript.js（8MB）の読み込みがあるので長めに待つ
//   - 実行中: JS レッスンと同じく3秒（無限ループを止める）

import type { Log } from "@/lib/lessons";

const COMPILE_TIMEOUT_MS = 30000;
const RUN_TIMEOUT_MS = 3000;

interface WorkerMessage {
  type: "log" | "warn" | "error" | "type-error" | "compiled" | "done";
  text?: string;
}

export function runTsCode(code: string): Promise<Log[]> {
  return new Promise((resolve) => {
    const worker = new Worker("/worker/ts-runner.js");
    const logs: Log[] = [];

    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve(logs);
    };

    const startTimer = (ms: number, message: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logs.push({ type: "error", text: message });
        finish();
      }, ms);
    };

    startTimer(
      COMPILE_TIMEOUT_MS,
      "TypeScript の準備に時間がかかっています。通信環境を確認して、もう一度実行してみて。"
    );

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;
      if (msg.type === "compiled") {
        // 型チェックを通過。ここからはユーザーのコードの実行時間なので3秒で打ち切る
        startTimer(
          RUN_TIMEOUT_MS,
          "実行時間が長すぎます（無限ループかも）。3秒で停止しました。"
        );
      } else if (msg.type === "done") {
        finish();
      } else if (msg.type === "type-error") {
        logs.push({ type: "error", text: msg.text ?? "型エラー" });
      } else {
        logs.push({ type: msg.type, text: msg.text ?? "" });
      }
    };

    worker.onerror = (e) => {
      logs.push({ type: "error", text: e.message || "実行エラー" });
      finish();
    };

    worker.postMessage({ code });
  });
}
