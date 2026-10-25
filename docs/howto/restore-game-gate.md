# How to: the sign-in gate on the Gigas Garden game page

## What happened

The game page (`/gigas-garden/`) is meant to send anyone who is not signed in to the sign-in page first. That check
lives in a small script, `web/public/auth-gate.js`. Until now the game file did not load that script itself. The
build step (`web/vite.config.js`) and the backend (`backend/server.js`) added the script tag on the fly.

On Oct 24, 2026 at 8:16 AM PT (gh-pages commit `4a92812`), the game page on the live site was updated by copying the
game file straight onto the `gh-pages` branch instead of going through the build. The copied file had no script tag,
so the live game page stopped asking people to sign in. Every later hand copy had the same gap.

## What was changed, and why

1. `web/public/gigas-garden/index.html`: two lines were added at the very top of `<head>`: a short note and
   `<script src="../auth-gate.js" data-mode="google"></script>`. The game file now loads the gate itself, so a
   hand copy to `gh-pages` keeps the gate. `data-mode="google"` is the setting the live GitHub Pages site uses.
2. `web/vite.config.js`: the build no longer adds a second tag. If the page already has the tag, the build only
   sets its `data-mode` to match the build settings. If the tag is missing, it adds it as before.
3. `backend/server.js`: same idea for the backend. It sets the tag's mode to `server` instead of adding a second tag.
4. `web/public/auth-gate.js` and `README.md`: comments and one README sentence updated to match. No behavior change.

The path `../auth-gate.js` means "one folder up from the game folder". On the live site that is
`https://xer0yootz.github.io/neon-vigil-oauth/auth-gate.js`. Locally it is `http://localhost:5173/auth-gate.js`.
Both were checked.

Side effect to know about: the game file is also the standalone Remix build. If that same file is uploaded to Remix
as is, the browser will try to load `../auth-gate.js` there, not find it, and carry on. The game still runs, but
there is one "file not found" line in the browser console. Remove those two lines from the Remix copy if that matters.

## Status

- The pull request was reviewed and merged into `main` with a normal merge (Jasmine's OK, Oct 25, 2026).
- The live site was then updated with one normal commit on `gh-pages` that changed only `gigas-garden/index.html`,
  adding the two gate lines. Nothing else on `gh-pages` changed. `auth-gate.js` was already there.
- `deploy/build-pages.sh` was **not** run. It stays on hold.

## How to test it

### On a computer

1. Open a private (incognito) browser window, so you are signed out.
2. Go to `https://xer0yootz.github.io/neon-vigil-oauth/gigas-garden/`.
3. You should land on the sign-in page. The address bar ends in `?next=%2Fneon-vigil-oauth%2Fgigas-garden%2F`.
4. Sign in. You should come back to the game, with two small icons on the left edge (back to the hub, and chat).

### On a phone

1. Open a private tab in your phone's browser and turn the phone sideways (landscape).
2. Go to the same address. You should land on the sign-in page.
3. Sign in. The game opens. Check that the touch controls still work and the two icons show on the left edge.

If you still see the game without signing in, the browser may be showing an old copy. Add `?v=2` to the end of
the address, or wait a few minutes for GitHub Pages to update.

## How to undo it

Never force-push. Each undo below is a new, normal commit.

1. **Undo the live site:** on GitHub, open the `gh-pages` branch, find the commit that changed
   `gigas-garden/index.html` to add the gate, and revert it (or run `git revert <that commit>` on `gh-pages`
   and push). The live page goes back to having no gate.
2. **Undo the code on `main`:** on the merged pull request page, click **Revert**. That opens a new pull request
   that takes the change back out. Review it and merge it. (On the command line: `git revert -m 1 <merge commit>`.)
3. Before a pull request is merged, undoing it is just closing it.

## Updating the live game page later (the safe way)

`deploy/build-pages.sh` is on hold. Until that changes, update the live game page like this:

1. Make sure `web/public/gigas-garden/index.html` on `main` still has the gate line near the top:
   `<script src="../auth-gate.js" data-mode="google"></script>`.
2. Copy that file to `gigas-garden/index.html` on the `gh-pages` branch, in a normal commit.
3. Before saving, check the gate line is still in the copied file and says `data-mode="google"`.
4. Check that `auth-gate.js` is still at the top level of `gh-pages`.
5. Run the computer and phone checks above.
