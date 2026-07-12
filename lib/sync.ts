// 進捗の同期ロジック。
//
// 基本方針は「ローカル優先で、失っていいものは何ひとつ無い」。
// ログインしたら、この端末の進捗とサーバーの進捗をマージして両方に書き戻す。
//   - クリア済みレッスン: 和集合（片方でクリアしていればクリア）
//   - 書きかけコード / チェックリスト: 両方のキーを合わせ、衝突したらローカルを優先
//     （いま目の前で書いているものを消さないため）

import { getSupabase, type RemoteProgress } from "@/lib/supabase";

export interface LocalProgress {
  completed: string[];
  code: Record<string, string>;
  checks: Record<string, number[]>;
}

export function mergeProgress(
  local: LocalProgress,
  remote: RemoteProgress | null
): LocalProgress {
  if (!remote) return local;
  return {
    completed: [...new Set([...remote.completed, ...local.completed])],
    code: { ...remote.code, ...local.code },
    checks: { ...remote.checks, ...local.checks },
  };
}

/** サーバーから自分の進捗を読む（無ければ null） */
export async function fetchRemoteProgress(
  userId: string
): Promise<RemoteProgress | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("progress")
    .select("completed, code, checks, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    completed: Array.isArray(data.completed) ? data.completed : [],
    code: data.code ?? {},
    checks: data.checks ?? {},
    updated_at: data.updated_at,
  };
}

/** サーバーへ自分の進捗を書く（1ユーザー1行の upsert） */
export async function pushRemoteProgress(
  userId: string,
  progress: LocalProgress
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from("progress").upsert(
    {
      user_id: userId,
      completed: progress.completed,
      code: progress.code,
      checks: progress.checks,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
