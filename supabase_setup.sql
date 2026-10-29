-- Supabase SQL Editor에서 실행하세요.
create table if not exists public.sudoku_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.sudoku_saves enable row level security;
create policy "read own save" on public.sudoku_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own save" on public.sudoku_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own save" on public.sudoku_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
