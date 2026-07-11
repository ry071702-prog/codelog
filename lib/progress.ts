// localStorage 進捗の save / load。
// Phase 0 では認証・DB なし。壊れたデータが入っていても落ちないよう握りつぶす。

const COMPLETED_KEY = "codelog:completed";
const CODE_KEY = "codelog:code";

export function loadCompleted(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveCompleted(ids: string[]): void {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(ids));
  } catch {
    // ストレージが使えない環境（プライベートモード等）では保存を諦める
  }
}

export function loadCode(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CODE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string") result[k] = v;
      }
      return result;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveCode(codeByLesson: Record<string, string>): void {
  try {
    localStorage.setItem(CODE_KEY, JSON.stringify(codeByLesson));
  } catch {
    // 同上
  }
}
