# syntax=docker/dockerfile:1

# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 2: Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Stage 3: Development
FROM base AS dev
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# Stage 4: Build
FROM base AS build
# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy all package.json files for workspace resolution
COPY apps/backend/package.json ./apps/backend/package.json
# Install dependencies
RUN pnpm install
# Copy source code
COPY apps/backend ./apps/backend
# Build the backend
RUN pnpm --filter @manila/backend build

# Stage 5: Production
FROM node:22-alpine AS production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

COPY apps/backend/package.json ./package.json
COPY pnpm-lock.yaml ./
RUN pnpm install --prod --no-frozen-lockfile

COPY --from=build /app/apps/backend/dist ./dist

EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]
