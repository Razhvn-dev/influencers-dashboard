#!/bin/bash
set -euo pipefail

# 1. 自动寻找代码位置
if [ -d "/app" ]; then
  cd /app
elif [ -d "/home/devbox/project" ]; then
  cd /home/devbox/project
fi

echo "=========================================="
echo "Entrypoint start: $(date -Iseconds)"
echo "Working directory: $(pwd)"
echo "Node: $(node -v) | npm: $(npm -v)"
echo "=========================================="

if [ -f "app/build-info.js" ]; then
  echo "Expected build from:"
  grep -E "BUILD_ID|ENTRYPOINT_VERSION" app/build-info.js || true
else
  echo "WARNING: app/build-info.js not found — stale or incomplete deploy package?"
fi

# 2. 安装依赖（含 devDependencies，否则 vite / react-router build 不可用）
echo "Installing dependencies..."
npm ci --include=dev

# 3. 构建前端与服务端 bundle（build/ 在 .gitignore 中，必须在每次发布时生成）
echo "Building application..."
npm run build

echo "Built client entry files:"
ls -la build/client/assets/entry.client*.js 2>/dev/null || echo "ERROR: no entry.client*.js in build output"

if grep -rq "session-fix-v3" build/client/assets/ 2>/dev/null; then
  echo "OK: session-fix-v3 found in client assets."
else
  echo "ERROR: session-fix-v3 NOT in build output — aborting."
  exit 1
fi

# 4. 生成 Prisma Client（跳过 migrate deploy，防止报错卡死）
echo "Generating Prisma Client..."
npx prisma generate

# 5. 启动应用
echo "Starting Shopify app on PORT=${PORT:-3000} ..."
echo "Verify after start: curl https://YOUR_DOMAIN/health"
exec npm run start
