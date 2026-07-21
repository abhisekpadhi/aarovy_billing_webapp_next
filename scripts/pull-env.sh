#!/usr/bin/env bash
set -euo pipefail

# Pull environment variables from the linked Vercel project into a local env file.
#
# Usage:
#   ./scripts/pull-env.sh                 # → .env (development)
#   ./scripts/pull-env.sh .env.local      # custom output file
#   ./scripts/pull-env.sh .env production # production env vars
#
# Prerequisites:
#   - Vercel CLI installed (`npm i -g vercel` or use npx)
#   - Logged in (`vercel login`)
#   - Project linked (`vercel link`) — runs once per clone

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_FILE="${1:-.env}"
ENVIRONMENT="${2:-development}"

if ! command -v vercel >/dev/null 2>&1; then
  echo "Error: Vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "Project not linked to Vercel. Running vercel link..."
  vercel link
fi

echo "Pulling '$ENVIRONMENT' env vars → $OUT_FILE"
vercel env pull "$OUT_FILE" --environment "$ENVIRONMENT" --yes

echo "Done. Wrote $(grep -c '^[A-Za-z_]' "$OUT_FILE" 2>/dev/null || echo 0) variables to $OUT_FILE"
