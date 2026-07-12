"use client";

// GitHub ログインと、進捗の端末間同期。
// Supabase を設定していないときは「未設定」だけ伝えて何も壊さない。

import { Check, LogOut, RefreshCw } from "lucide-react";
import { useProgress } from "@/components/ProgressProvider";

/** GitHub のマーク（lucide はブランドアイコンを配っていないので自前で持つ） */
function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function AccountPanel() {
  const { syncEnabled, user, syncing, signIn, signOut, completed } = useProgress();

  if (!syncEnabled) {
    return (
      <div className="rounded-2xl border border-line bg-card p-6">
        <div className="text-[15px] font-bold text-ink">アカウント同期</div>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-sub">
          未設定です。環境変数（NEXT_PUBLIC_SUPABASE_URL /
          NEXT_PUBLIC_SUPABASE_ANON_KEY）を登録すると、GitHub
          ログインで端末をまたいだ進捗同期が使えるようになります。
        </p>
      </div>
    );
  }

  const name =
    (user?.user_metadata?.user_name as string | undefined) ??
    user?.email ??
    "ログイン中";

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-bold text-ink">アカウント同期</div>
        {syncing && (
          <span className="flex items-center gap-1.5 text-[12px] text-accent">
            <RefreshCw size={13} className="animate-spin" /> 同期中…
          </span>
        )}
      </div>

      {user ? (
        <>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] leading-relaxed text-sub">
            <Check size={15} className="text-ok" />
            <span>
              <span className="font-bold text-ink">{name}</span> として同期中
              — 進捗（{completed.length}レッスン）はどの端末からでも続きから学べます
            </span>
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-4 flex items-center gap-1.5 rounded-[9px] border border-line bg-card px-4 py-2 text-sm font-bold text-sub transition-colors hover:border-accent hover:text-accent"
          >
            <LogOut size={15} /> ログアウト
          </button>
          <p className="mt-2 text-[12px] text-faint">
            ログアウトしてもこの端末の進捗は消えません
          </p>
        </>
      ) : (
        <>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-sub">
            GitHub でログインすると、進捗がアカウントに保存され、スマホと
            PC のどちらからでも続きから学べます。いまこの端末にある進捗（
            {completed.length}レッスン）は、ログイン時にアカウント側と自動でマージされます
            — どちらの進捗も失われません。
          </p>
          <button
            type="button"
            onClick={() => void signIn()}
            className="mt-4 flex items-center gap-2 rounded-[9px] bg-ink px-4 py-2.5 text-sm font-bold text-canvas transition-opacity hover:opacity-90"
          >
            <GithubMark size={16} /> GitHub でログイン
          </button>
        </>
      )}
    </div>
  );
}
