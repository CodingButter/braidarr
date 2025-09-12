# Multi-stage build for production
FROM node:20-alpine AS base
RUN npm install -g pnpm@8.15.0
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY packages/server/package.json ./packages/server/
COPY packages/web/package.json ./packages/web/
RUN pnpm install --frozen-lockfile

# Build stage for shared packages
FROM base AS build-shared
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared/
COPY packages/config ./packages/config/
COPY tsconfig.json ./
COPY package.json ./
RUN pnpm --filter @braidarr/shared build
RUN pnpm --filter @braidarr/config build

# Build stage for server
FROM base AS build-server
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist/
COPY --from=build-shared /app/packages/config/dist ./packages/config/dist/
COPY packages/server ./packages/server/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY tsconfig.json ./
COPY package.json ./
RUN pnpm --filter @braidarr/server build

# Build stage for web
FROM base AS build-web
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist/
COPY packages/web ./packages/web/
COPY packages/shared/package.json ./packages/shared/
COPY tsconfig.json ./
COPY package.json ./
RUN pnpm --filter @braidarr/web build

# Production server image
FROM node:20-alpine AS server
RUN npm install -g pnpm@8.15.0
WORKDIR /app

# Copy server build and dependencies
COPY --from=build-server /app/packages/server/dist ./dist/
COPY --from=build-server /app/packages/server/package.json ./
COPY --from=build-shared /app/packages/shared/dist ./node_modules/@braidarr/shared/dist/
COPY --from=build-shared /app/packages/shared/package.json ./node_modules/@braidarr/shared/
COPY --from=build-shared /app/packages/config/dist ./node_modules/@braidarr/config/dist/
COPY --from=build-shared /app/packages/config/package.json ./node_modules/@braidarr/config/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 braidarr
USER braidarr

EXPOSE 3401
ENV NODE_ENV=production
ENV PORT=3401
ENV HOST=0.0.0.0

CMD ["node", "dist/index.js"]

# Production web image (nginx)
FROM nginx:alpine AS web
COPY --from=build-web /app/packages/web/dist /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]