# 5150 Character Auth

Backend scaffold for session auth, location climate, zodiac caste, BitChat, and GitHub ability unlocks.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Server listens on http://localhost:3000.

## Env

PORT and FRONTEND_URL both default to 3000. If the web app binds the same port, move one of them.
OPEN_CAGE_API_KEY is reserved for reverse geocoding. Not wired yet.
BITCHAT_ENABLED defaults true. BitChat still needs BITCHAT_BASE_URL and BITCHAT_API_KEY.

## Routes

- GET /health
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/character/assign
- GET /api/bitchat/status
- POST /api/bitchat/connect
- GET /api/github/abilities

Database is SQLite at backend/data/users.db. Not MongoDB.

Caste map is a first pass. Not final canon.
BitChat is a stub until a real endpoint is set.

## Web app and GitHub Pages

Flow: sign in, then the hub, which offers **Play Gigas Garden** and **Chat**. `/gigas-garden/` is gated. With no session it redirects to sign-in with `?next=` and returns to the game after sign-in. The game page also gets small icon links back to the hub and to chat (`web/public/auth-gate.js`). The game file loads the gate from a tag near the top of its `<head>`, so a hand copy to gh-pages keeps it; the build and the backend set that tag's mode.

`VITE_AUTH_MODE` picks how sign-in works:

- `server` (default): the Express backend handles email login plus Google and GitHub OAuth. The backend also gates `/gigas-garden/`. Run `npm run dev` at the root and in `web/`.
- `google`: for static hosting (GitHub Pages). Google Identity Services runs in the browser and needs only the public `VITE_GOOGLE_CLIENT_ID`; no secret is involved. This is a front-door gate for a public site, not access control.
- `mock`: dev only. A fake local session, clearly bannered. Never deploy it.

GitHub Pages: https://xer0yootz.github.io/neon-vigil-oauth/ is served from the `gh-pages` branch, built by `deploy/build-pages.sh` (base `/neon-vigil-oauth/`, `VITE_AUTH_MODE=google`). `deploy/github-pages-workflow.yml` is the ready Actions version. Move it to `.github/workflows/` with a token that has the `workflow` scope, then switch the Pages source to GitHub Actions.

- Set `GOOGLE_CLIENT_ID` when building (repo variable for the Actions version) (a Google Cloud OAuth client of type "Web application").
- Authorized JavaScript origins: `https://xer0yootz.github.io` and `http://localhost:5173`.
- GIS popup sign-in needs no redirect URI.
- Chat on Pages shows "not connected" until a chat backend exists. The BitChat room uses the Express API and SQLite.
- Never put API keys (xAI, Gemini, ElevenLabs) in `web/`; everything there ships to the browser.
