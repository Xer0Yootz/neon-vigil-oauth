# Bitchat: name lock, and Hexa and Cyphr replies

This guide covers two changes to the Neon Vigil chat room (bitchat). Read it top to bottom once. The steps only you can do are in section 6.

## 1. What changed and why

1. **Name lock. It is live on Supabase now.**
   1. Every player picks a chat name the first time they post. They choose it once, and nobody else can have it.
   2. Nobody can pick the name of a Neon Vigil character, or a near copy of one. The check catches different capitals, spaces, accents, lookalike letters from other alphabets (like Cyrillic "Неха"), letters swapped for numbers ("H3xa", "N3on"), padding ("TheRealNeon", "xX_H3XA_Xx", "cyphr_fan2") and numbered versions ("Val-05", "VAL 17").
   3. Every message is stamped with the sender's claimed name by the database itself. A player can't type someone else's name into a message, even if they bypass the website.
   4. Only Hexa and Cyphr can post as Hexa and Cyphr, and only from the server. The portraits in chat now follow that server flag, not the name, so nobody can borrow a portrait.
   5. Why: you asked that nobody can pose as a character or as another player.
2. **Hexa and Cyphr replies. They are built and tested, but NOT switched on and NOT deployed.**
   1. When a message mentions @Hexa or @Cyphr, exactly one of them answers. If a message names both, the one named first answers. They never both answer.
   2. Each reply is written by an AI model using that character's rules. Before anything is posted, the server:
      1. removes dashes;
      2. blocks every word on your banned list, rewriting once and then posting nothing;
      3. posts no fixed lines at all. Praxia's lines come from the book (Jasmine 10-25), so a question about syncing with Praxia goes to the model like any other, and Hexa or Cyphr answers in character without quoting a fixed line for her;
      4. cuts the old ship status line out of any reply. You retired that line on 10-25, so the server no longer posts it, the character rules no longer mention it, and if the model ever writes it anyway it is removed before posting. A question like "@Cyphr ship status" now gets a normal in-character answer;
      5. when the rules don't cover a question, has Hexa say "Not on record." and Cyphr say "No record.".
   3. Limits keep it cheap and calm:
      1. 3 AI replies a minute and 30 a day for each player;
      2. 6 a minute for the whole room;
      3. 20 seconds between replies from the same character;
      4. 200 a day in total;
      5. a kill switch that is off until you turn it on.
   4. Why: you asked for Hexa and Cyphr voices in the room. They test on Grok first, with Gemini's free tier as the main option later.

## 2. Where things are (paths)

1. `supabase/migrations/20261025233317_bitchat_name_lock.sql`: the name lock (applied 10-25).
2. `supabase/migrations/20261025233350_bitchat_name_lock_variants.sql`: also catches "xX…Xx" wrappers and the spelling "Cypher" (applied 10-25).
3. `supabase/pending/20261025233442_bitchat_ai_replies.sql`: links each AI reply to the message it answers, one reply per message. **Not applied.** It needs your OK (section 6).
4. `supabase/functions/ai-chat/`: the reply function.
   1. `index.ts`: the entry point.
   2. `handler.ts`: the checks and limits.
   3. `router.ts`: who answers. There are no fixed lines.
   4. `filter.ts`: the banned words, dashes and sign-off.
   5. `providers.ts`: Grok (xAI) and Gemini.
   6. `store.ts`: the database access.
   7. `personas/hexa.md` and `personas/cyphr.md`: the character rules. Edit these.
   8. `personas.generated.ts`: made from the two .md files. Don't edit it by hand.
   9. `build-personas.ts`: rebuilds that file.
   10. `ai_chat_test.ts`: the tests.
5. `web/src/pages/GroupChatPage.jsx` and `web/src/chatNames.js`: the site's Chat page (pick a name, clear messages, ask for replies).
6. `web/public/gigas-garden/index.html`: the game's CHAT popup can now post too (see 4.3).

## 3. The reserved names and where each comes from

Every name comes from a canon file. None were invented. "Contains" means the name is blocked anywhere inside a longer name. For example, "Praxia" also blocks "PraxiaFan".

1. From `grok-project-canon-digest.md` §2, plus the character file named in each row:
   1. Hexa
   2. Hexa Sigil (contains)
   3. Cyphr (contains)
   4. Cypher (spelling variant)
   5. Neon
   6. Neon Ultra (contains)
   7. Xero
   8. Unit X-07
   9. X-07
   10. Curipira (contains)
   11. Curupira (contains)
   12. Praxia (contains)
   13. Roxy
   14. Valerie
   15. Valkyrie (contains)
   16. VAL
   17. Val 17
   18. VAL-01
   19. VAL-18
   20. Noor
   21. Alyha (contains)
   22. Aaliyah
   23. Aaliyha (the two banned misspellings of Alyha)
   24. Star
   25. Cali Rose (contains)
   26. Xavier
   27. X-08
   28. Jade
   29. Nikita
   30. Nexus (contains)
   31. Nexus-01
   32. X-10
   33. Chrome King (contains)
   34. Kael Voss (contains)
   35. Kyle
   36. The Teacher
2. From the game's speaker list: Grid Log.
3. From the Hexa and Cyphr rules: "User" (only your account is "User").
4. To add a name: Supabase dashboard → Table Editor → `reserved_names` → Insert row. Fill in `name`, tick `match_contains` if you want it blocked inside longer names, and fill in `source`. Only you (the service role) can edit this table. Players can't even read it.
5. If a player already holds a name you reserve later, they keep the profile, but their next post is refused with "That name belongs to a Neon Vigil character." Ask me and I'll rename them for you. Players can't rename themselves.

## 4. How to test it

### 4.1 Desktop (after the PR is merged and the site is published)
1. Open the site, sign in, and go to Chat.
2. The first time, you'll see "Pick your chat name." Try `H3xa`. You should see "That name belongs to a Neon Vigil character. Pick a name of your own."
3. Pick your own name, for example `Moth Rider`. Tap Claim name. You'll see "Posting as Moth Rider."
4. In a second browser or a private window, sign in as someone else and try `moth_rider`. You should see "Another player already has that name. Try a different one."
5. Post a message. It shows under your claimed name.
6. Post `@Hexa hello`. Until replies are switched on (section 6), nothing answers and chat works normally.

### 4.2 Phone
1. Repeat 4.1 in Safari or Chrome on your phone. The name form and the Send button fit the small screen. The keyboard's Go/Return key submits.
2. Turn the phone sideways and back. The chat should stay usable.

### 4.3 The game's CHAT popup
1. In the same browser where you've used the site's Chat page, open the game and press CHAT (or the C key).
2. If you have a chat name, it says "Posting as …" and SEND works. If not, it asks you to pick one, with the same messages as the site.
3. If you never signed in on the site in that browser, it says to open Chat on the site once. The game has no sign-in screen of its own.
4. Typing in the chat box no longer moves the player or triggers game keys (C, E, V, Q, B, Space).

### 4.4 The tests (no internet calls, no AI cost)
1. Install Deno, then run this from the repo root:
   `deno test --node-modules-dir=none --allow-read supabase/functions/ai-chat/`
2. You should see 22 tests pass. The tests use pretend models and a pretend database. Any real internet call makes them fail.

## 5. How to undo

1. **Undo the site and game changes:** revert this PR on GitHub (the PR page has a Revert button), then publish as usual.
2. **Undo the name lock in Supabase:**
   1. Revert the site first. The old Chat page sends its own name, so it would fail once the lock is gone without the revert.
   2. Then, in Supabase → SQL Editor, run:

```sql
begin;
drop trigger if exists messages_guard on public.messages;
drop trigger if exists profiles_guard on public.profiles;
alter table public.messages drop constraint if exists messages_author_ck;
delete from public.messages where is_ai;          -- AI rows have no user_id
alter table public.messages alter column user_id set not null;
alter table public.messages drop column if exists character_tag;
alter table public.messages drop column if exists is_ai;
drop table if exists public.profiles;
drop table if exists public.reserved_names;
drop schema if exists private cascade;
delete from supabase_migrations.schema_migrations where version in ('20261025233317', '20261025233350');
commit;
```

3. **Undo the reply link** (only if you applied the pending file):

```sql
begin;
drop index if exists public.messages_ai_created_idx;
drop index if exists public.messages_one_ai_reply;
alter table public.messages drop constraint if exists messages_reply_only_ai;
alter table public.messages drop column if exists reply_to;
commit;
```

4. **Turn the replies off right away:** set the secret `AI_REPLIES_ENABLED` to `false`, or delete it. No redeploy is needed. To remove the function completely, run `supabase functions delete ai-chat --project-ref xlikqzdpctuayyqttdce`.

## 6. Steps only you can do

1. **Approve and apply the pending migration.** The reply function needs `supabase/pending/20261025233442_bitchat_ai_replies.sql`. Say OK and I'll apply it, or paste it into Supabase → SQL Editor yourself.
2. **Model:** you picked Grok for testing, then Gemini's free tier as the main option. Grok is the default: `AI_PROVIDER=xai` with model `grok-4.3` ($1.25 in and $2.50 out per million tokens; a short chat reply costs a small fraction of a cent).
3. **Add the secrets.** Supabase → Edge Functions → Secrets (or approve me doing it). Keys live only here, never in the site or the game.
   1. `XAI_API_KEY`: your xAI key.
   2. `CREATOR_USER_ID`: your own Supabase user id (Authentication → Users → your row). Hexa calls only this account "User" and signs off "Further Directives, User?" only to you.
   3. `AI_REPLIES_ENABLED`: `true` when you want replies on. Anything else means off.
   4. Optional: `AI_PROVIDER` (`xai` or `gemini`), `XAI_MODEL`, `GEMINI_MODEL`, `AI_DAILY_CAP` (default 200), `USER_PER_MINUTE` (3), `USER_PER_DAY` (30), `ROOM_PER_MINUTE` (6), `CHARACTER_COOLDOWN_SEC` (20), `ALLOWED_ORIGINS` (default `https://xer0yootz.github.io,http://localhost:5173`).
4. **Deploy the function:** `supabase functions deploy ai-chat --project-ref xlikqzdpctuayyqttdce`. Keep the normal sign-in check on, so don't add `--no-verify-jwt`.
5. **Merge the PR** and publish the site as usual.
6. **Switching to Gemini later:**
   1. Get a key in Google AI Studio.
   2. Add the secret `GEMINI_API_KEY`.
   3. Set `AI_PROVIDER` to `gemini`. The model defaults to `gemini-3.8-flash`, which has a free tier.
   4. No code change or redeploy is needed. To go back, set `AI_PROVIDER` to `xai`.
   5. **Note:** on Gemini's free tier, Google may use what is sent (chat messages and the character rules) to improve its products. The paid tier doesn't do that.
7. **Answer the open Queries** (section 7) when you're ready. Until then, the Cyphr rules use the draft choices.

## 7. Open Queries

1. **Cyphr Q1. Who is "User", and does Cyphr say it?** (a) only your account is "User"; (b) Cyphr calls every player "User", as the game does; (c) Cyphr calls nobody "User". The draft uses (a).
2. **Cyphr Q2 (answered by Jasmine 10-25). Who says the Praxia sync line?** Nobody in chat. That line is no longer locked, and the book decides Praxia's lines. Chat posts no fixed line for her.
3. **Cyphr Q5. What may Cyphr say about the drive and the time jump?** (a) nothing beyond "the time-warp stays out of the lesson; only the original VAL could work it"; (b) she may state the drive's requirements. The draft uses (a).
4. **Cyphr Q14. Her hair: answered.** Jasmine (10-25): white "event horizon" hair like Hexa's. Added to `personas/cyphr.md`.
5. **Names: common real names are blocked.** Kyle, Jade, Star, Xavier, Nikita, Valerie, Roxy, Noor and "The Teacher" are canon names, so a real player called Jade can't use it. Keep them, or block only the full forms?
6. **Names: should "Jasmine" be kept for you?** It isn't reserved now, because it isn't a character name.
7. **Names: "Neon Vigil" and "Hex OS Sigil"** aren't reserved. Add them?
8. **Names: renaming.** For now only you can rename a player, by asking me. Players can't rename themselves. Is that right?
