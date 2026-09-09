# Stage 1: Build React frontend
FROM node:20-alpine AS client-builder

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./

RUN npm run build

# Stage 2: Production runtime (Express API + static frontend)
FROM node:20-alpine AS production

WORKDIR /app

ARG BUILD_GIT_SHA=unknown
ARG BUILD_TIME=unknown

ENV NODE_ENV=production
ENV BUILD_GIT_SHA=$BUILD_GIT_SHA
ENV BUILD_TIME=$BUILD_TIME

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY server.js db.js shopify.js ./
COPY routes ./routes
COPY lib ./lib
COPY init.sql ./init.sql
COPY migrations ./migrations
COPY scripts/run-migrations.mjs ./scripts/run-migrations.mjs
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate && exec npm start"]
