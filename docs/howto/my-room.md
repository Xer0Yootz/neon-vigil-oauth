# My Room: going from the Bridge Console to your Infinity 6 quarters

Branch `neon-vigil/my-room`. Nothing here is live. It reaches the public site only when you merge it and say to publish.

## What changed and why

1. **Room v2 came in as it was.** The six Room v2 commits from branch `cursor/infiniti6-rooms-cf0c` (the radio, windows onto the Garden, the outside canopy, Live and Edit modes, and the edit controls) were merged in with a normal merge. No history was rewritten. You said "let it go for the game, it will still feel cramped", so the windows and canopy stay.
2. **The room page is behind the sign-in gate now.** `web/public/Infinity_6-rooms/index.html` loads `../auth-gate.js` the same way the game page does (PR #4). Without a session it sends you to sign-in and then brings you back to the room.
3. **The build and the backend gate both pages.** `web/vite.config.js` and `backend/server.js` now handle a short list of gated pages, `gigas-garden` and `Infinity_6-rooms`, the same way. A test link like `?stage=room` survives the trip through sign-in.
4. **The Bridge Console has a choice.** In `web/public/gigas-garden/index.html`, using the Bridge Console (Cyphr) opens a small **BRIDGE CONSOLE** card with two buttons:
   - **BRIDGE** does what the console always did: it sets the locker objective and plays Cyphr's line. That line is unchanged.
   - **MY ROOM** opens `../Infinity_6-rooms/`. It's the same site, so the sign-in session carries over.
   - On desktop, E or Space opens the card and Esc or **CLOSE** shuts it. On a phone, tap INTERACT, then tap a button. The buttons are 48 px tall.
5. **There's a way back.** The room page has a **BACK TO BRIDGE** button at the top left. It opens `../gigas-garden/`.
6. **There's a test link.** Adding `?stage=room` to the game link jumps straight to the room.
7. **The room saves on this device only.** Layouts are kept in this browser (localStorage key `nv.Infinity_6.rooms.v1`). Rooms are private, so there's no visiting. Clearing site data or switching phones starts the room fresh.
8. **No new words or lore.** The only new UI text is BRIDGE CONSOLE, BRIDGE, MY ROOM, CLOSE and BACK TO BRIDGE. No binaries, no secrets, nothing in Supabase, no changes to `remix.json`, and `deploy/build-pages.sh` was not run.

## Files

- `web/public/Infinity_6-rooms/index.html`: Room v2, plus the gate tag and the BACK TO BRIDGE button
- `web/public/gigas-garden/index.html`: the console card, the `?stage=room` jump, and Esc to close
- `web/vite.config.js`: gates both pages in dev and in the build
- `backend/server.js`: gates both pages on the Express server
- `docs/howto/my-room.md`: this guide

## How to test it

Desktop:
1. Open the game, tap the sigil and skip the opening lines.
2. You start beside the Bridge Console. Press **E** and the BRIDGE CONSOLE card appears.
3. Press **Esc** to close it. Press E again, then click **BRIDGE**. The objective changes to the locker, as before.
4. Press E again and click **MY ROOM**. The room opens.
5. Click **Edit**, pick **Crate** and click an empty tile to place it.
6. Click **Select** and drag the crate to another tile.
7. Reload the page. The crate is still where you left it.
8. Click the crate, then **Remove**. Reload, and it stays gone.
9. Click **BACK TO BRIDGE**. You're back at the game's title card.
10. Open the game link with `?stage=room` on the end. It goes straight to the room.

Phone: do the same steps, but tap **INTERACT** (the hand button) instead of pressing E. Tap a tile to place a piece, drag it with one finger, and use two fingers to turn and zoom the view.

What I tested (headless browser, local server, a fake test session in the test browser only): all ten steps passed on desktop (1280×800) and phone (390×844, touch). The room page also sends you to sign-in when there's no session, and the dev server and backend both gate `/Infinity_6-rooms/`. The site build passed. Screenshots are in `/workspace/nvcode/screens/my-room-*.png` on the box.

Note: going back to the Bridge reloads the game, so you start from the title card again. The game doesn't save a run yet.

## How to undo it

- Before merging: close the PR. Nothing else changes.
- After merging: open the merge commit on GitHub and click **Revert**, or run `git revert -m 1 <merge commit>` and open that as a PR. Room v2 and the gate tag come out together.
- If it was published to gh-pages: revert that gh-pages commit the same way (`git revert <commit>`). Never force-push.

## Steps only you can do

1. Review the PR and the screenshots, and merge if you're happy with it.
2. Publishing to gh-pages happens only when you say so. Remember that the live sign-in still needs your Google client ID (ending in `.apps.googleusercontent.com`), or nobody can get in.

## Queries for you (held, not changed)

- **Q1. Green in the Garden.** The Garden is violet-black in canon, but Room v2 uses green outside the windows:
  - canopy leaf texture: `#0c2818`, `#145c32`, `#1e7a40`, `#0f4a28`, `#2f8f4e`, `#123d22`, `#3dba68`, `#0a3a22`, with emissive glow `0x0c3a22`
  - `leaf` material: `0x3dba78`, emissive `0x14663c`
  - `moss` material (planter tops and hanging clumps): `0x1d6a4e`, emissive `0x0e3a2c`
  - `leafDeep` is already plum (`0x6e3058`).
  Should these move to the violet-black Garden palette?
- **Q2. Personal rooms.** Canon has "quarters" and "berths a cramped complement of one thousand", but nothing about a player's own room or decorating one. Is this OK as a game feature?
- **Q3. The radio.** Room v2 streams outside internet stations (Jerome FM, Sutro FM, Nightride, SSR, Chillsynth, Yumi Co). Canon has Cyphr as the ship's sound system. Should it stay, or switch to Cyphr's own music?
- **Q4. The room names.** The page title is "Room v2 — Infinity 6", and the rooms are Quarters A, Quarters B and Mess. Do you want different names?
- **Q5. Faint pink tint.** The room's screen tint has a very faint magenta wash, and SHIP_CANON says "no pink fog or pink haze on board". It's a UI tint, not fog. Keep it?
