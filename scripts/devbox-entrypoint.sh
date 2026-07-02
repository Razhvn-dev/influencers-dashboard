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

echo "[entrypoint] Installing backend dependencies..."
npm install --omit=dev

if [ -f client/dist/index.html ]; then
  echo "[entrypoint] Using pre-built frontend from client/dist"
else
  echo "[entrypoint] Installing frontend dependencies (with dev tools for Vite build)..."
  npm install --prefix client --include=dev

  echo "[entrypoint] Building React frontend..."
  if [ -z "$SHOPIFY_API_KEY" ]; then
    echo "[entrypoint] WARNING: SHOPIFY_API_KEY is not set — embed App Bridge meta tag will be empty"
  fi
  unset LOCAL_DEV
  export LOCAL_DEV=
  npm run build
fi

echo "[entrypoint] Starting Influencer Dashboard on port 3000..."
exec npm start
