#!/bin/bash
# Place this file at DevBox project root: ~/project/entrypoint.sh
# Code repo lives in: ~/project/Influencers_Dashboard

set -e

APP_DIR="/home/devbox/project/Influencers_Dashboard"

if [ ! -d "$APP_DIR" ]; then
  echo "[entrypoint] ERROR: $APP_DIR not found"
  exit 1
fi

cd "$APP_DIR"

if [ -d .git ]; then
  echo "[entrypoint] Syncing latest code from origin/main..."
  git fetch origin main
  git reset --hard origin/main
  echo "[entrypoint] Git commit: $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"
else
  echo "[entrypoint] WARNING: .git not found — using snapshot code only"
fi

export BUILD_GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
export BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "[entrypoint] Installing backend dependencies..."
npm install --omit=dev

echo "[entrypoint] Installing frontend dependencies (with dev tools for Vite build)..."
npm install --prefix client --include=dev

echo "[entrypoint] Building React frontend..."
if [ -z "$SHOPIFY_API_KEY" ]; then
  echo "[entrypoint] WARNING: SHOPIFY_API_KEY is not set — App Bridge meta tag will be empty"
fi
unset LOCAL_DEV
export LOCAL_DEV=
rm -rf client/dist
npm run build

echo "[entrypoint] Frontend bundle:"
ls -1 client/dist/assets/index-*.js 2>/dev/null || echo "[entrypoint] WARNING: no JS bundle found"

echo "[entrypoint] Starting Influencer Dashboard on port 3000..."
echo "[entrypoint] BUILD_GIT_SHA=$BUILD_GIT_SHA BUILD_TIME=$BUILD_TIME"
exec npm start
