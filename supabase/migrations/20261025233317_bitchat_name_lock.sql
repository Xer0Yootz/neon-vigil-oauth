-- bitchat name lock (Jasmine's OK, 2026-10-25).
-- 1. No player can post as a Neon Vigil character (or a close variant: case, spacing, punctuation,
--    accents, look-alike letters, leetspeak, filler like "the", "real", "bot", "official").
-- 2. Every display name belongs to one account. A player claims a name once in public.profiles,
--    and every message they post carries that claimed name. The database sets it, not the browser.
-- 3. Only the server (service role, used by the ai-chat Edge Function) can post as Hexa or Cyphr.
-- The reserved list lives in public.reserved_names. Only the service role (dashboard / SQL editor) can edit it.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Name folding ---------------------------------------------------------------------------------------
-- fold_base: Unicode compatibility forms (fullwidth, math letters), accents stripped, lower case,
-- common Cyrillic and Greek look-alikes mapped to Latin.
create or replace function private.fold_base(raw text)
returns text language sql immutable parallel safe set search_path = '' as $$
  select translate(
    lower(regexp_replace(normalize(coalesce(raw, ''), NFKD), '[\u0300-\u036f\u0483-\u0489]', '', 'g')),
    'аеорсухкмтнвіјѕԁɡһӏԛԝαβεηικνορτυχωϲ',
    'aeopcyxkmthbijsdghlqwabenikvoptyxwc');
$$;

-- name_key: the key that makes a player name unique. Letters and digits only, after folding.
-- "Neo Rider", "neo_rider" and "ΝΕΟ RIDER" share one key.
create or replace function private.name_key(raw text)
returns text language sql immutable parallel safe set search_path = '' as $$
  select regexp_replace(private.fold_base(raw), '[^a-z0-9]', '', 'g');
$$;

-- strip_filler: drops filler words at the start or end ("TheRealHexa", "cyphr_bot", "NeonFan").
create or replace function private.strip_filler(k text)
returns text language sql immutable parallel safe set search_path = '' as $$
  select regexp_replace(regexp_replace(coalesce(k, ''), '^(the|real|official|its|im|iam|not)+', ''),
                        '(ai|bot|official|real|tv|fan|online|hq)+$', '');
$$;

-- name_variants: every way a name is compared against the reserved list.
--  alnum (digits kept), letters only (digits dropped), leetspeak 0=o 1=i 3=e 4=a 5=s 7=t 8=b, and 1=l,
--  each also with filler stripped.
create or replace function private.name_variants(raw text)
returns text[] language sql immutable parallel safe set search_path = '' as $$
  with b as (select private.fold_base(raw) as v),
  k as (
    select unnest(array[
      regexp_replace(v, '[^a-z0-9]', '', 'g'),
      regexp_replace(v, '[^a-z]', '', 'g'),
      regexp_replace(translate(v, '0134578@$!|', 'oieastbasil'), '[^a-z]', '', 'g'),
      regexp_replace(translate(v, '0134578@$!|', 'oleastbasil'), '[^a-z]', '', 'g')
    ]) as k from b
  ),
  all_k as (select k from k union select private.strip_filler(k) from k)
  select coalesce(array_agg(distinct k) filter (where k <> ''), '{}') from all_k;
$$;

-- Reserved character names ---------------------------------------------------------------------------
create table if not exists public.reserved_names (
  name text primary key check (char_length(btrim(name)) between 1 and 60),
  -- true: also block names that contain it ("CyphrFan2", "xPraxiax"). Use only for distinctive names.
  match_contains boolean not null default false,
  source text,
  created_at timestamptz not null default now()
);
alter table public.reserved_names enable row level security;
revoke all on public.reserved_names from public, anon, authenticated;
grant all on public.reserved_names to service_role;

insert into public.reserved_names (name, match_contains, source) values
  ('Hexa', false, 'grok-project-canon-digest.md §2; ai_personalities/hexa-sigil.md; game SPEAKERS'),
  ('Hexa Sigil', true, 'grok-project-canon-digest.md §2; ai_personalities/hexa-sigil.md; game SPEAKERS'),
  ('Cyphr', true, 'grok-project-canon-digest.md §2; ai_personalities/cyphr_v2.md; game SPEAKERS'),
  ('Neon', false, 'grok-project-canon-digest.md §2; grok-project/NWD_Naming_Canon.md'),
  ('Neon Ultra', true, 'grok-project-canon-digest.md §2; grok-project/Neon_Ultra_Bio.md; game SPEAKERS'),
  ('Xero', false, 'grok-project-canon-digest.md §2; ai_personalities/xero.md'),
  ('Unit X-07', false, 'grok-project-canon-digest.md §2 (Xero)'),
  ('X-07', false, 'grok-project-canon-digest.md §2 (Xero)'),
  ('Curipira', true, 'grok-project-canon-digest.md §2 (Xero, bible spelling)'),
  ('Curupira', true, 'grok-project-canon-digest.md §2 (Xero, memory 10-10 spelling)'),
  ('Praxia', true, 'grok-project-canon-digest.md §2; ai_personalities/praxia.md; game SPEAKERS'),
  ('Roxy', false, 'grok-project-canon-digest.md §2 (Praxia)'),
  ('Valerie', false, 'grok-project-canon-digest.md §2 (VAL / Valérie)'),
  ('Valkyrie', true, 'grok-project-canon-digest.md §2; canon-character-sheets/Valkyrie_Val17.md'),
  ('VAL', false, 'grok-project-canon-digest.md §2 (VAL-1 to VAL-18)'),
  ('Val 17', false, 'canon-character-sheets/Valkyrie_Val17.md; ai_personalities/val-17.md; game SPEAKERS'),
  ('VAL-01', false, 'grok-project-canon-digest.md §2'),
  ('VAL-18', false, 'grok-project-canon-digest.md §2; grok-project/NWD_Naming_Canon.md'),
  ('Noor', false, 'grok-project-canon-digest.md §2 (Crew); ai_personalities/noor.md'),
  ('Alyha', true, 'grok-project-canon-digest.md §2 (Crew); ai_personalities/alyha.md'),
  ('Aaliyah', false, 'grok-project-canon-digest.md §2 (banned misspelling of Alyha)'),
  ('Aaliyha', false, 'grok-project-canon-digest.md §2 (banned misspelling of Alyha)'),
  ('Star', false, 'grok-project-canon-digest.md §2 (Crew); canon-character-sheets/Star.md'),
  ('Cali Rose', true, 'grok-project-canon-digest.md §2 (Crew); grok-project/NWD_Naming_Canon.md'),
  ('Xavier', false, 'grok-project-canon-digest.md §2 (Others); canon-character-sheets/Xavier.md'),
  ('X-08', false, 'grok-project-canon-digest.md §2 (Xavier)'),
  ('Jade', false, 'grok-project-canon-digest.md §2 (reserve crew)'),
  ('Nikita', false, 'grok-project-canon-digest.md §2 (reserve crew); ai_personalities/nikita.md'),
  ('Nexus', true, 'grok-project-canon-digest.md §2 (Others); canon-character-sheets/Nexus.md'),
  ('Nexus-01', false, 'grok-project-canon-digest.md §2'),
  ('X-10', false, 'grok-project-canon-digest.md §2 (Nexus)'),
  ('Chrome King', true, 'grok-project-canon-digest.md §2 (Nexus variant)'),
  ('Kael Voss', true, 'grok-project-canon-digest.md §2; canon-character-sheets/Kael_Voss.md'),
  ('Kyle', false, 'grok-project-canon-digest.md §2 (Kael Voss)'),
  ('The Teacher', false, 'grok-project-canon-digest.md §2 (Others)'),
  ('Grid Log', false, 'game web/public/gigas-garden/index.html SPEAKERS (GRID LOG // SYNC LOCK)'),
  ('User', false, 'ai_personalities/hexa-sigil.md and cyphr_v2.md: only the creator is addressed as User')
on conflict (name) do nothing;

-- Returns the reserved name a display name collides with, or null.
create or replace function private.reserved_name_match(display_name text)
returns text language sql stable security definer set search_path = '' as $$
  with cand as (select unnest(private.name_variants(display_name)) as c),
  res as (
    select r.name, r.match_contains, unnest(private.name_variants(r.name)) as k
    from public.reserved_names r
  )
  select res.name
  from res join cand on true
  where res.k <> ''
    -- the letters-only form of a short name with digits (X-07 -> "x") is too broad to block on its own
    and char_length(res.k) >= 2
    and (cand.c = res.k or (res.match_contains and char_length(res.k) >= 5 and strpos(cand.c, res.k) > 0))
  order by char_length(res.name) desc
  limit 1;
$$;

-- Player profiles: one claimed name per account, one account per name --------------------------------
create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 24),
  -- Set by the trigger below (letters and digits only, look-alikes folded). Unique: one account per name.
  name_key text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_name_key_unique on public.profiles (name_key);
alter table public.profiles enable row level security;
create policy "players read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "players claim their own name once" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
-- No update or delete for players: a name is claimed once. Jasmine can rename someone from the dashboard.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (user_id, display_name) on public.profiles to authenticated;

create or replace function private.profiles_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  hit text;
begin
  new.display_name := btrim(regexp_replace(new.display_name, '\s+', ' ', 'g'));
  new.name_key := private.name_key(new.display_name);
  if char_length(new.name_key) < 2 then
    raise exception 'Pick a name with at least two letters or numbers.'
      using errcode = 'P0001', hint = 'name_invalid';
  end if;
  hit := private.reserved_name_match(new.display_name);
  if hit is not null then
    raise exception 'The name "%" belongs to a Neon Vigil character. Please pick a different name.', new.display_name
      using errcode = 'P0001', hint = 'name_reserved', detail = hit;
  end if;
  if exists (select 1 from public.profiles p
             where p.name_key = new.name_key and p.user_id is distinct from new.user_id) then
    raise exception 'The name "%" is already taken by another player.', new.display_name
      using errcode = 'P0001', hint = 'name_taken';
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before insert or update on public.profiles
  for each row execute function private.profiles_guard();

-- Messages: the name comes from the poster's claimed profile ------------------------------------------
alter table public.messages
  add column if not exists is_ai boolean not null default false,
  add column if not exists character_tag text;
alter table public.messages alter column user_id drop not null;
alter table public.messages drop constraint if exists messages_author_ck;
alter table public.messages add constraint messages_author_ck check (
  (is_ai and character_tag in ('hexa', 'cyphr') and user_id is null)
  or (not is_ai and character_tag is null and user_id is not null)
);
-- Column grants for players stay as before (room_id, user_id, user_name, body). Players can never set
-- is_ai or character_tag. The trigger below fills user_name from the claimed profile and rejects any other name.

create or replace function private.messages_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  claim_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
  privileged boolean;
  claimed text;
  hit text;
begin
  -- Service role (the ai-chat Edge Function) or a direct admin connection with no API token.
  privileged := claim_role = 'service_role'
    or (claim_role is null and session_user not in ('authenticator', 'anon', 'authenticated'));

  if new.is_ai or new.character_tag is not null then
    if not privileged then
      raise exception 'Only the server can post as Hexa or Cyphr.' using errcode = '42501';
    end if;
    new.is_ai := true;
    new.user_id := null;
    new.user_name := case new.character_tag when 'hexa' then 'Hexa Sigil' when 'cyphr' then 'Cyphr' end;
    if new.user_name is null then
      raise exception 'Only hexa and cyphr may post as AI characters.' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.user_id is null then
    raise exception 'Player messages need a signed-in player.' using errcode = '23502';
  end if;
  select p.display_name into claimed from public.profiles p where p.user_id = new.user_id;
  if claimed is null then
    raise exception 'Pick your chat name before you post.' using errcode = 'P0001', hint = 'name_required';
  end if;
  -- Re-checked on every post, so names added to the reserved list later take effect right away.
  hit := private.reserved_name_match(claimed);
  if hit is not null then
    raise exception 'The name "%" belongs to a Neon Vigil character. Please ask for a new name.', claimed
      using errcode = 'P0001', hint = 'name_reserved', detail = hit;
  end if;
  -- A player may only post under their own claimed name. Sending no name is fine: the claimed one is used.
  if new.user_name is not null and private.name_key(new.user_name) <> private.name_key(claimed) then
    raise exception 'You can only post as your own name, "%".', claimed
      using errcode = 'P0001', hint = 'name_mismatch';
  end if;
  new.user_name := claimed;
  return new;
end;
$$;
drop trigger if exists messages_guard on public.messages;
create trigger messages_guard before insert or update on public.messages
  for each row execute function private.messages_guard();

revoke all on all functions in schema private from public, anon, authenticated;
