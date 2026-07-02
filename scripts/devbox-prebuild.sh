#!/bin/bash
# Run in DevBox BEFORE clicking "Publish Version" to build frontend on Node 18.
# Usage: bash scripts/devbox-prebuild.sh

set -e

APP_DIR="/home/devbox/project/Influencers_Dashboard"
cd "$APP_DIR"

echo "[prebuild] Installing dependencies..."
npm install --omit=dev
npm install --prefix client --include=dev

echo "[prebuild] Building frontend (production — LOCAL_DEV disabled)..."
unset LOCAL_DEV
export LOCAL_DEV=
rm -rf client/dist
npm run build

echo "[prebuild] Done. client/dist is ready."
echo "[prebuild] Next: DevBox -> Publish Version -> Deploy"
