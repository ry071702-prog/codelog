"use client";

// 進捗（クリア済みレッスン・書きかけコード・チェックリスト）をアプリ全体で共有する Context。
//
// 保存先は2段構え:
//   1. localStorage — 常に保存する。ログインしていなくても進捗は残る
//   2. Supabase     — ログインしているときだけ。端末をまたいで続きから学べる
//
// ログインした瞬間に、この端末の進捗とサーバーの進捗をマージする（どちらも失わない）。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
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
import { getSupabase, isSyncEnabled } from "@/lib/supabase";
import { fetchRemoteProgress, mergeProgress, pushRemoteProgress } from "@/lib/sync";

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
  /** 同期（ログイン）まわり。Supabase 未設定なら syncEnabled = false */
  syncEnabled: boolean;
  user: User | null;
  syncing: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [syncing, setSyncing] = useState(false);

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

  // ── ここから同期（Supabase を設定しているときだけ動く）
  // ログイン直後のマージで「いまの端末の進捗」を参照する。
  // マージ処理は auth のコールバックから呼ばれるため、最新値を ref で持っておく
  // （state を直接見ると、コールバックが作られた時点の古い値を掴んでしまう）。
  const stateRef = useRef({ completed, codeByLesson, checksByLesson });
  useEffect(() => {
    stateRef.current = { completed, codeByLesson, checksByLesson };
  });

  const mergeWithRemote = useCallback(async (signedInUser: User) => {
    setSyncing(true);
    const local = {
      completed: stateRef.current.completed,
      code: stateRef.current.codeByLesson,
      checks: stateRef.current.checksByLesson,
    };
    const remote = await fetchRemoteProgress(signedInUser.id);
    const merged = mergeProgress(local, remote);

    setCompleted(merged.completed);
    setCodeByLesson(merged.code);
    setChecksByLesson(merged.checks);
    await pushRemoteProgress(signedInUser.id, merged);
    setSyncing(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !loaded) return;

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        void mergeWithRemote(data.user);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      // ログインした瞬間だけマージする（以降は下の effect が書き戻す）
      if (event === "SIGNED_IN" && nextUser) void mergeWithRemote(nextUser);
    });

    return () => sub.subscription.unsubscribe();
  }, [loaded, mergeWithRemote]);

  // ログイン中は、変更をまとめてサーバーへ書き戻す（打鍵のたびに送らない）
  useEffect(() => {
    if (!loaded || !user || syncing) return;
    const t = setTimeout(() => {
      void pushRemoteProgress(user.id, {
        completed,
        code: codeByLesson,
        checks: checksByLesson,
      });
    }, 2000);
    return () => clearTimeout(t);
  }, [loaded, user, syncing, completed, codeByLesson, checksByLesson]);

  const signIn = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/settings` },
    });
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    // 進捗はこの端末に残る（localStorage は消さない）
  }, []);

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
        syncEnabled: isSyncEnabled,
        user,
        syncing,
        signIn,
        signOut,
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
