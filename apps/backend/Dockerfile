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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter @manila/backend --prod --frozen-lockfile

# Stage 3: Development
FROM base AS dev
RUN pnpm install --filter @manila/backend
EXPOSE 3000
CMD ["pnpm", "--filter", "@manila/backend", "dev"]

# Stage 4: Build
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter @manila/backend --frozen-lockfile
RUN pnpm --filter @manila/backend build

# Stage 5: Production
FROM base AS production

# Create a non-root user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Copy dependencies and built files with correct ownership
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules /app/node_modules
COPY --from=prod-deps --chown=nodejs:nodejs /app/apps/backend/node_modules /app/apps/backend/node_modules
COPY --from=build --chown=nodejs:nodejs /app/apps/backend/dist /app/apps/backend/dist

# Copy drizzle config and migrations for database migrations
COPY --from=base --chown=nodejs:nodejs /app/apps/backend/drizzle.config.ts /app/apps/backend/drizzle.config.ts
COPY --from=base --chown=nodejs:nodejs /app/apps/backend/drizzle /app/apps/backend/drizzle

# Create uploads directory with correct ownership
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]