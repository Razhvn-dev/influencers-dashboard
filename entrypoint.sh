#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "[entrypoint] Installing backend dependencies..."
npm install --omit=dev

echo "[entrypoint] Installing frontend dependencies..."
npm install --prefix client

echo "[entrypoint] Building React frontend..."
npm run build

echo "[entrypoint] Starting Influencer Dashboard on port 3000..."
exec npm start
