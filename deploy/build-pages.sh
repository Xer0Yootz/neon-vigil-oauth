#!/usr/bin/env bash
# Builds the GitHub Pages site (sign-in, hub, chat, gated Gigas Garden) into web/dist.
# Usage: GOOGLE_CLIENT_ID=<public web client id> deploy/build-pages.sh
# Then publish web/dist to the gh-pages branch. Only public values go in: the Google client ID, the Supabase
# project URL and its publishable (anon) key. Never a service_role/secret key or any other API key.
# Chat (bitchat, Neon Vigil room) uses Supabase project "Neon Vigil" (ref xlikqzdpctuayyqttdce); schema in supabase/migrations.
set -euo pipefail
cd "$(dirname "$0")/../web"
npm install --no-audit --no-fund
# Optional untracked web/.env.supabase.local (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) fills in the defaults.
if [ -f .env.supabase.local ]; then set -a; . ./.env.supabase.local; set +a; fi
SUPABASE_URL="${SUPABASE_URL:-${VITE_SUPABASE_URL:-https://xlikqzdpctuayyqttdce.supabase.co}}"
SUPABASE_PUBLISHABLE_KEY="${SUPABASE_PUBLISHABLE_KEY:-${VITE_SUPABASE_ANON_KEY:-}}"
case "${SUPABASE_PUBLISHABLE_KEY:-}" in
  ''|sb_publishable_*) ;;
  *) echo "SUPABASE_PUBLISHABLE_KEY must be the public sb_publishable_ key, never a secret key." >&2; exit 1 ;;
esac
VITE_BASE=/neon-vigil-oauth/ VITE_AUTH_MODE=google VITE_GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}" \
  VITE_SUPABASE_URL="$SUPABASE_URL" VITE_SUPABASE_ANON_KEY="${SUPABASE_PUBLISHABLE_KEY:-}" npx vite build --emptyOutDir
touch dist/.nojekyll
