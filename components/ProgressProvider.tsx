"use client";

// 進捗（クリア済みレッスン・書きかけコード）をアプリ全体で共有する Context。
// マウント時に localStorage から復元し、変更のたびに保存する（コードは 800ms デバウンス）。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loadChecks,
  loadCode,
  loadCompleted,
  loadPreviewStore,
  saveChecks,
  saveCode,
  saveCompleted,
  savePreviewStore,
} from "@/lib/progress";

interface ProgressContextValue {
  loaded: boolean;
  completed: string[];
  markCompleted: (lessonId: string) => void;
  codeByLesson: Record<string, string>;
  setCodeFor: (lessonId: string, code: string) => void;
  /** MODULE 08 のチェックリスト（レッスンID → チェック済みの行番号） */
  checksByLesson: Record<string, number[]>;
  toggleCheck: (lessonId: string, index: number) => void;
  /** プレビュー iframe に渡す localStorage の中身（レッスンごと） */
  previewStore: Record<string, Record<string, string>>;
  setPreviewStoreFor: (lessonId: string, store: Record<string, string>) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [codeByLesson, setCodeByLesson] = useState<Record<string, string>>({});
  const [checksByLesson, setChecksByLesson] = useState<Record<string, number[]>>({});
  const [previewStore, setPreviewStore] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    // localStorage は SSR に存在しないため、hydration 後に読む必要がある
    // （初期 state で読むとサーバーとクライアントの描画がズレる）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompleted(loadCompleted());
    setCodeByLesson(loadCode());
    setChecksByLesson(loadChecks());
    setPreviewStore(loadPreviewStore());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveCompleted(completed);
  }, [completed, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => saveCode(codeByLesson), 800);
    return () => clearTimeout(t);
  }, [codeByLesson, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveChecks(checksByLesson);
  }, [checksByLesson, loaded]);

  useEffect(() => {
    if (!loaded) return;
    savePreviewStore(previewStore);
  }, [previewStore, loaded]);

  const markCompleted = useCallback((lessonId: string) => {
    setCompleted((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  }, []);

  const setCodeFor = useCallback((lessonId: string, code: string) => {
    setCodeByLesson((prev) => ({ ...prev, [lessonId]: code }));
  }, []);

  const toggleCheck = useCallback((lessonId: string, index: number) => {
    setChecksByLesson((prev) => {
      const current = prev[lessonId] ?? [];
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index];
      return { ...prev, [lessonId]: next };
    });
  }, []);

  const setPreviewStoreFor = useCallback(
    (lessonId: string, store: Record<string, string>) => {
      setPreviewStore((prev) => ({ ...prev, [lessonId]: store }));
    },
    []
  );

  return (
    <ProgressContext.Provider
      value={{
        loaded,
        completed,
        markCompleted,
        codeByLesson,
        setCodeFor,
        checksByLesson,
        toggleCheck,
        previewStore,
        setPreviewStoreFor,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress は ProgressProvider の中で使う");
  }
  return ctx;
}
