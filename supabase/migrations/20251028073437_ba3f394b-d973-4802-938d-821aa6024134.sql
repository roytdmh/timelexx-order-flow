-- Admin sessions for per-admin analytics and reporting

-- 1) Create admin_sessions table
create table public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  admin_name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  active boolean not null default true
);

-- Enable RLS
alter table public.admin_sessions enable row level security;

-- Indexes
create index idx_admin_sessions_user_active on public.admin_sessions (user_id, active);
create index idx_admin_sessions_started_at on public.admin_sessions (started_at);

-- 2) RLS policies: users can manage their own sessions
create policy "Users can view their own sessions" on public.admin_sessions
for select using (auth.uid() = user_id);

create policy "Users can create their own sessions" on public.admin_sessions
for insert with check (auth.uid() = user_id);

create policy "Users can update their own sessions" on public.admin_sessions
for update using (auth.uid() = user_id);

-- 3) Function + trigger to end previous active session before inserting a new one
create or replace function public.end_previous_admin_sessions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.admin_sessions
    set ended_at = now(), active = false
    where user_id = new.user_id and active = true;
  return new;
end;
$$;

create trigger trg_end_previous_admin_sessions
before insert on public.admin_sessions
for each row execute function public.end_previous_admin_sessions();

-- 4) Add confirmed_by_session_id to orders to tie confirmations to a session
alter table public.orders add column confirmed_by_session_id uuid references public.admin_sessions(id);
create index idx_orders_confirmed_by_session on public.orders (confirmed_by_session_id);
