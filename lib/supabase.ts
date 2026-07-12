// Supabase クライアント（進捗のアカウント同期に使う）。
//
// 環境変数が無いときは null を返す。つまり Supabase を設定していなくても
// codelog は今までどおり動き、進捗はブラウザ内（localStorage）にだけ残る。
// 設定すると、GitHub ログイン + 端末をまたいだ進捗同期が有効になる。
//
// ここで使うのは anon（公開）キーのみ。公開前提のキーで、行レベルセキュリティ（RLS）が
// 「自分の行しか読み書きできない」を保証する。service_role キーは絶対に置かない。

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase を設定していれば true（未設定でもサイトは動く） */
export const isSyncEnabled = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  client ??= createClient(url, anonKey);
  return client;
}

/** progress テーブル1行の形（ユーザーごとに1行） */
export interface RemoteProgress {
  completed: string[];
  code: Record<string, string>;
  checks: Record<string, number[]>;
  updated_at?: string;
}
