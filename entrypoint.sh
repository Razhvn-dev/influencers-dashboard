#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "[entrypoint] Installing backend dependencies..."
npm install --omit=dev

echo "[entrypoint] Installing frontend dependencies (with dev tools for Vite build)..."
npm install --prefix client --include=dev

echo "[entrypoint] Building React frontend..."
npm run build

echo "[entrypoint] Starting Influencer Dashboard on port 3000..."
exec npm start
