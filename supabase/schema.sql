-- codelog の進捗テーブル。
-- Supabase の SQL Editor に貼り付けて Run するだけでよい（1回きり）。
--
-- 大事なのは RLS（行レベルセキュリティ）。
-- 「自分の行しか読み書きできない」をデータベース自身に守らせるので、
-- ブラウザに公開される anon キーが漏れても、他人の進捗は覗けない。

create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  completed  jsonb not null default '[]'::jsonb,   -- クリア済みレッスンID
  code       jsonb not null default '{}'::jsonb,   -- 書きかけコード
  checks     jsonb not null default '{}'::jsonb,   -- MODULE 08 のチェックリスト
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- 自分の行だけ読める
drop policy if exists "read own progress" on public.progress;
create policy "read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

-- 自分の行だけ作れる
drop policy if exists "insert own progress" on public.progress;
create policy "insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

-- 自分の行だけ更新できる
drop policy if exists "update own progress" on public.progress;
create policy "update own progress"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
