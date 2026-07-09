#!/usr/bin/env bash
# Applies supabase/migrations/*.sql to the project. Run once per environment
# before starting the dev or production server, and again whenever the
# migrations change. A single command: triggers `supabase login` itself
# (interactive, opens a browser) if not already authenticated, so there's
# nothing to run beforehand — unless you'd rather authenticate non-interactively,
# see SUPABASE_ACCESS_TOKEN below.
#
# Reads apps/api/.env (must exist — copy apps/api/.env.example first) for:
#   SUPABASE_URL            required; the project ref is derived from this
#   SUPABASE_ACCESS_TOKEN    optional; CLI auth, skips the `supabase login` prompt
#   SUPABASE_DB_PASSWORD     optional; lets `supabase link` run non-interactively
#
# Set SETUP_DEBUG=1 to pass --debug through to the CLI.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE="apps/api/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "error: $ENV_FILE not found. Run: cp apps/api/.env.example apps/api/.env, fill in SUPABASE_URL, then retry." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [ -z "${SUPABASE_URL:-}" ]; then
  echo "error: SUPABASE_URL is not set in $ENV_FILE." >&2
  exit 1
fi

PROJECT_REF="$(echo "$SUPABASE_URL" | sed -E 's#^https?://([^.]+)\.supabase\.(co|in).*#\1#')"
if [ -z "$PROJECT_REF" ] || [ "$PROJECT_REF" = "$SUPABASE_URL" ]; then
  echo "error: could not derive a project ref from SUPABASE_URL='$SUPABASE_URL' (expected https://<ref>.supabase.co)." >&2
  exit 1
fi

SUPABASE=(npx --yes supabase)
DEBUG_FLAG=()
if [ -n "${SETUP_DEBUG:-}" ]; then
  DEBUG_FLAG=(--debug)
fi

echo "==> Checking Supabase CLI authentication..."
if ! "${SUPABASE[@]}" projects list "${DEBUG_FLAG[@]}" >/dev/null 2>&1; then
  echo "==> Not authenticated — running 'supabase login' (opens a browser)..."
  if ! "${SUPABASE[@]}" login "${DEBUG_FLAG[@]}"; then
    cat >&2 <<MSG
error: 'supabase login' failed or was cancelled.

Alternatively, add SUPABASE_ACCESS_TOKEN=sbp_... to $ENV_FILE (generate at
https://supabase.com/dashboard/account/tokens) and re-run: npm run setup
MSG
    exit 1
  fi
fi

echo "==> Linking project ($PROJECT_REF)..."
LINK_ARGS=(link --project-ref "$PROJECT_REF")
if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
  LINK_ARGS+=(-p "$SUPABASE_DB_PASSWORD")
fi
if ! "${SUPABASE[@]}" "${LINK_ARGS[@]}" "${DEBUG_FLAG[@]}"; then
  echo "error: 'supabase link' failed. Re-run with SETUP_DEBUG=1 npm run setup for details." >&2
  exit 1
fi

echo "==> Applying supabase/migrations/*.sql..."
if ! "${SUPABASE[@]}" db push --yes "${DEBUG_FLAG[@]}"; then
  echo "error: 'supabase db push' failed. Re-run with SETUP_DEBUG=1 npm run setup for details." >&2
  exit 1
fi

echo "==> Done — schema applied to project $PROJECT_REF."
