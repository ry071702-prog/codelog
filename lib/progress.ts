// localStorage 進捗の save / load。
// Phase 0 では認証・DB なし。壊れたデータが入っていても落ちないよう握りつぶす。

const COMPLETED_KEY = "codelog:completed";
const CODE_KEY = "codelog:code";
const CHECKS_KEY = "codelog:checks";
const PREVIEW_STORE_KEY = "codelog:preview-store";

/** 汎用: レッスンID をキーにした記録の読み書き（壊れた値は捨てる） */
function loadRecord<T>(key: string, isValid: (v: unknown) => v is T): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: Record<string, T> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (isValid(v)) result[k] = v;
    }
    return result;
  } catch {
    return {};
  }
}

function saveRecord(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ストレージが使えない環境では保存を諦める
  }
}

const isNumberArray = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((n) => typeof n === "number");

const isStringMap = (v: unknown): v is Record<string, string> =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.values(v).every((s) => typeof s === "string");

/** MODULE 08 のチェックリスト（レッスンID → チェック済みの行番号） */
export function loadChecks(): Record<string, number[]> {
  return loadRecord(CHECKS_KEY, isNumberArray);
}

export function saveChecks(checks: Record<string, number[]>): void {
  saveRecord(CHECKS_KEY, checks);
}

/**
 * プレビュー（sandbox iframe）の中で使う localStorage の中身。
 * iframe は隔離されていて本物の localStorage を持てないため、親が預かる。
 */
export function loadPreviewStore(): Record<string, Record<string, string>> {
  return loadRecord(PREVIEW_STORE_KEY, isStringMap);
}

export function savePreviewStore(
  store: Record<string, Record<string, string>>
): void {
  saveRecord(PREVIEW_STORE_KEY, store);
}

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
