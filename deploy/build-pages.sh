#!/usr/bin/env bash
# Builds the GitHub Pages site (sign-in, hub, chat, gated Gigas Garden) into web/dist.
# Usage: GOOGLE_CLIENT_ID=<public web client id> deploy/build-pages.sh
# Then publish web/dist to the gh-pages branch. Only the public client ID goes in; never a secret or API key.
set -euo pipefail
cd "$(dirname "$0")/../web"
npm install --no-audit --no-fund
VITE_BASE=/neon-vigil-oauth/ VITE_AUTH_MODE=google VITE_GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}" npx vite build --emptyOutDir
touch dist/.nojekyll
