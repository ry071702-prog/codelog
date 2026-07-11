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
  loadCode,
  loadCompleted,
  saveCode,
  saveCompleted,
} from "@/lib/progress";

interface ProgressContextValue {
  loaded: boolean;
  completed: string[];
  markCompleted: (lessonId: string) => void;
  codeByLesson: Record<string, string>;
  setCodeFor: (lessonId: string, code: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [codeByLesson, setCodeByLesson] = useState<Record<string, string>>({});

  useEffect(() => {
    // localStorage は SSR に存在しないため、hydration 後に読む必要がある
    // （初期 state で読むとサーバーとクライアントの描画がズレる）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompleted(loadCompleted());
    setCodeByLesson(loadCode());
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

  const markCompleted = useCallback((lessonId: string) => {
    setCompleted((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  }, []);

  const setCodeFor = useCallback((lessonId: string, code: string) => {
    setCodeByLesson((prev) => ({ ...prev, [lessonId]: code }));
  }, []);

  return (
    <ProgressContext.Provider
      value={{ loaded, completed, markCompleted, codeByLesson, setCodeFor }}
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
