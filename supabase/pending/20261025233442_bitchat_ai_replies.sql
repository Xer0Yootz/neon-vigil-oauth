-- PENDING. Not applied. Needs Jasmine's OK (it is for the Hexa/Cyphr replies, not the name lock).
-- Lets the ai-chat Edge Function link each Hexa or Cyphr reply to the player message it answers.
-- The unique index means one message can get at most one AI reply: never both Hexa and Cyphr.
alter table public.messages
  add column if not exists reply_to uuid references public.messages (id) on delete cascade;
alter table public.messages drop constraint if exists messages_reply_only_ai;
alter table public.messages add constraint messages_reply_only_ai check (reply_to is null or is_ai);
create unique index if not exists messages_one_ai_reply on public.messages (reply_to) where is_ai;
create index if not exists messages_ai_created_idx on public.messages (created_at desc) where is_ai;
-- Players get no grant on reply_to (their insert grant stays room_id, user_id, user_name, body).
