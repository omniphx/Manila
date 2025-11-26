# syntax=docker/dockerfile:1

# Stage 1: Base
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . /app
WORKDIR /app

# Stage 2: Production run-time dependencies
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Stage 3: Development
FROM base AS dev
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "dev"]

# Stage 4: Build
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @manila/backend build

# Stage 5: Production
FROM base AS production
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/apps/backend/node_modules /app/apps/backend/node_modules
COPY --from=build /app/apps/backend/dist /app/apps/backend/dist
EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]