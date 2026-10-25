-- bitchat name lock, follow-up: two close variants the first pass missed.
-- 1. "xX_name_Xx" wrappers ("xX_H3XA_Xx") are stripped like other filler.
-- 2. "Cypher" is blocked as a spelling variant of Cyphr.
create or replace function private.strip_filler(k text)
returns text language sql immutable parallel safe set search_path = '' as $$
  select regexp_replace(
           regexp_replace(regexp_replace(coalesce(k, ''), '^(the|real|official|its|im|iam|not)+', ''),
                          '(ai|bot|official|real|tv|fan|online|hq)+$', ''),
           '^xx+(.+?)xx+$', '\1');
$$;
revoke all on function private.strip_filler(text) from public, anon, authenticated;

insert into public.reserved_names (name, match_contains, source) values
  ('Cypher', false, 'spelling variant of Cyphr (grok-project-canon-digest.md §2)')
on conflict (name) do nothing;
