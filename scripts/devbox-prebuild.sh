#!/bin/bash
# Run in DevBox BEFORE clicking "Publish Version" to build frontend on Node 18.
# Usage: bash scripts/devbox-prebuild.sh

set -e

APP_DIR="/home/devbox/project/Influencers_Dashboard"
cd "$APP_DIR"

echo "[prebuild] Installing dependencies..."
npm install --omit=dev
npm install --prefix client --include=dev

echo "[prebuild] Building frontend..."
npm run build

echo "[prebuild] Done. client/dist is ready."
echo "[prebuild] Next: DevBox -> Publish Version -> Deploy"
