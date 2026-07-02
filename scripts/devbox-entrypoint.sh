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

echo "[entrypoint] Installing frontend dependencies..."
npm install --prefix client

echo "[entrypoint] Building React frontend..."
npm run build

echo "[entrypoint] Starting Influencer Dashboard on port 3000..."
exec npm start
