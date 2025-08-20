-- Push queue for server-side scheduled single-shot notifications
create table if not exists public.push_queue (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  due_at timestamp with time zone not null,
  status text not null default 'pending', -- pending | sent | failed
  error text,
  created_at timestamp with time zone default now(),
  sent_at timestamp with time zone
);

create index if not exists idx_push_queue_due on public.push_queue(due_at);
create index if not exists idx_push_queue_status on public.push_queue(status);

alter table public.push_queue enable row level security;

-- owners can insert/view their own queued items
create policy if not exists "push_queue_insert_own" on public.push_queue
  for insert with check (auth.uid() = user_id);

create policy if not exists "push_queue_select_own" on public.push_queue
  for select using (auth.uid() = user_id);

-- updates are performed by service role; service role bypasses RLS

