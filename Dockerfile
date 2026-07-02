# Stage 1: Build React frontend
FROM node:20-alpine AS client-builder

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

RUN npm run build

# Stage 2: Production runtime (Express API + static frontend)
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js db.js shopify.js ./
COPY routes ./routes
COPY lib ./lib
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 3000

CMD ["npm", "start"]
