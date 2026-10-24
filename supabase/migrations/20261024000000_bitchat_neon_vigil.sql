-- bitchat on Supabase: the Neon Vigil room for the static (GitHub Pages) web app.
-- Anyone may read. Only a signed-in Supabase user (Google or anonymous) may post, and only as themselves.

create table if not exists public.rooms (
  id text primary key check (id ~ '^[a-z0-9-]{1,40}$'),
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now()
);

insert into public.rooms (id, name) values ('neon-vigil', 'Neon Vigil') on conflict (id) do nothing;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null default 'neon-vigil' references public.rooms (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  user_name text not null check (char_length(btrim(user_name)) between 1 and 60),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_room_created_idx on public.messages (room_id, created_at desc);
create index if not exists messages_user_idx on public.messages (user_id);

alter table public.rooms enable row level security;
alter table public.messages enable row level security;

-- Reads: open to everyone (anon and signed-in).
create policy "rooms are readable by everyone" on public.rooms
  for select to anon, authenticated using (true);
create policy "messages are readable by everyone" on public.messages
  for select to anon, authenticated using (true);

-- Writes: signed-in users post only as themselves. No update or delete policies, so those are denied.
create policy "signed-in users post their own messages" on public.messages
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Column-level privileges: clients cannot set id or created_at, and cannot touch rooms.
revoke all on public.rooms from anon, authenticated;
grant select on public.rooms to anon, authenticated;
revoke all on public.messages from anon, authenticated;
grant select on public.messages to anon, authenticated;
grant insert (room_id, user_id, user_name, body) on public.messages to authenticated;

-- Realtime: broadcast new messages (Realtime still applies the select policy per subscriber).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
