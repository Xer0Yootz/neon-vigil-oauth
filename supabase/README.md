# bitchat on Supabase

Project: **Neon Vigil** (ref `xlikqzdpctuayyqttdce`, org New World Dysorder, free plan, us-west-2).
The static GitHub Pages build talks to it straight from the browser with the publishable key; RLS does the access control.

- `public.rooms` (id, name, created_at): seeded with `neon-vigil` / "Neon Vigil". Read-only for clients.
- `public.messages` (id, room_id, user_id, user_name, body, created_at): Realtime on for inserts.
  - read: everyone (anon and signed-in)
  - insert: signed-in only, `auth.uid() = user_id`, body 1 to 2000 chars, name 1 to 60 chars;
    clients can only set room_id, user_id, user_name, body (no id/created_at); no update or delete.
  - name lock (migrations `20261025233317`, `20261025233350`): a player must first claim a name in
    `public.profiles` (once, unique, never a Neon Vigil character name from `public.reserved_names`).
    The `messages_guard` trigger stamps every player message with that name and refuses any other.
    `is_ai` / `character_tag` rows (Hexa, Cyphr) can only come from the service role.
- `supabase/pending/`: migrations written but NOT applied (they need the owner's OK).
- `supabase/functions/ai-chat`: Hexa/Cyphr replies. Not deployed. See `docs/howto/bitchat-name-lock-and-voices.md`.

## Auth
The web app signs in with Google (Identity Services) and then hands the same ID token to
`supabase.auth.signInWithIdToken({ provider: 'google' })`. If that is not set up yet, chat tries an anonymous
Supabase session; if anonymous sign-ins are off too, the room is read-only.

Dashboard settings (Authentication > Sign In / Providers):
1. Google: enable, paste the same Web client ID used for `GOOGLE_CLIENT_ID` into "Client IDs" (the client secret
   is only needed for redirect sign-in, not for ID tokens). Leave "Skip nonce check" off.
   In Google Cloud, the same OAuth Web client needs `https://xer0yootz.github.io` as an Authorized JavaScript origin.
2. Optional, for guest posting before Google works: enable "Allow anonymous sign-ins" (consider CAPTCHA).
3. URL Configuration: add `https://xer0yootz.github.io/neon-vigil-oauth/` to Site URL / Redirect URLs.
