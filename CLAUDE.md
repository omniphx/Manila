# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo with three main applications:

- **`apps/backend`** - Fastify-based API server with tRPC (TypeScript, Node.js)
- **`apps/frontend`** - Next.js web application (TypeScript, React)
- **`apps/mobile`** - Expo/React Native mobile app (TypeScript, React Native)

All packages use TypeScript and share common development tools configured at the root.

## Getting Started

### Initial Setup

```bash
# Install all dependencies
pnpm install
```

### Environment Variables

#### Backend

The backend requires environment variables to be configured. Copy the example file and fill in the values:

```bash
cd apps/backend
cp .env.example .env.development
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_PUBLISHABLE_KEY` - Clerk authentication public key
- `CLERK_SECRET_KEY` - Clerk authentication secret key

#### Frontend (Vercel)

The frontend app is deployed to Vercel and uses Clerk for authentication. To run the app locally, you need to pull environment variables from Vercel:

```bash
# Login to Vercel (if not already logged in)
npx vercel login

# Navigate to the frontend app
cd apps/frontend

# Pull environment variables from Vercel
npx vercel env pull .env.development.local
```

This will create a `.env.development.local` file with the necessary environment variables (Clerk keys, etc.) for local development.

**Note:** The `.env.development.local` file contains secrets and should not be committed to version control. It's already in `.gitignore`.

#### Mobile

The mobile app uses Clerk for authentication. Environment variables are set via `EXPO_PUBLIC_` prefix:

```bash
cd apps/mobile
# Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file
```

## Development Commands

### Running the project

```bash
# Install all dependencies
pnpm install

# Run all packages in development mode (parallel)
pnpm dev

# Run a specific package
pnpm --filter @manila/backend dev
pnpm --filter @manila/frontend dev
```

### Building

```bash
# Build all packages
pnpm build

# Build a specific package
pnpm --filter @manila/backend build
pnpm --filter @manila/frontend build
```

### Testing

```bash
# Run tests across all packages
pnpm test

# Run tests for a specific package
pnpm --filter @manila/backend test

# Run backend tests with UI (Vitest)
pnpm --filter @manila/backend test:ui
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint a specific package
pnpm --filter @manila/frontend lint
```

### Cleaning

```bash
# Remove all node_modules and build artifacts
pnpm clean

# Clean a specific package
pnpm --filter @manila/backend clean
```

## Architecture

### Backend (`apps/backend`)

The backend is a Fastify server with tRPC for type-safe API endpoints.

**Key architectural components:**

- **Server Framework**: Fastify with plugins for security (helmet, CORS, rate limiting)
- **API Layer**: tRPC routers for type-safe API endpoints
- **Database**: PostgreSQL with Drizzle ORM and pgvector for embeddings
- **Authentication**: Clerk integration via `@clerk/fastify`
- **Context**: tRPC context provides authenticated user info and database access to all procedures

**Entry point**: `src/index.ts` - Sets up Fastify server with middleware and tRPC plugin

**Database schema**: `src/db/schema.ts` - Drizzle schema definitions for users, refresh_tokens, and embeddings tables

**tRPC routers**:
- `src/trpc/router.ts` - Main router that combines all sub-routers
- `src/trpc/routers/*` - Individual route handlers (health, embeddings)
- `src/trpc/context.ts` - Context creation with Clerk auth and database access

**Environment**:
- Development uses `.env.development`, production uses `.env`
- Schema validation via Zod in `src/lib/env.ts`
- Build output: `dist/`
- Runtime: Node.js with ES modules (`type: "module"`)
- Dev tool: `tsx` for hot-reloading

**Database commands:**
```bash
cd apps/backend

# Generate migrations from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly to database (development)
pnpm db:push

# Open Drizzle Studio GUI
pnpm db:studio
```

**Docker commands:**
```bash
cd apps/backend

# Run development environment with Docker
pnpm docker:dev

# Build production Docker images
pnpm docker:prod:build

# Run production environment
pnpm docker:prod:up

# Build and run production (combined)
pnpm docker:prod

# Stop all containers
pnpm docker:down

# View logs
pnpm docker:logs

# Clean up volumes and containers
pnpm docker:clean
```

The backend exposes endpoints:
- `/` - API info and available endpoints
- `/health` - Health check endpoint
- `/trpc` - tRPC endpoint for all API procedures

### Frontend (`apps/frontend`)

**Key architectural components:**

- **Framework**: Next.js 16 with App Router and React 19
- **Authentication**: Clerk via `@clerk/nextjs` with ClerkProvider wrapper
- **Styling**: Tailwind CSS v4
- **Layout**: Root layout (`app/layout.tsx`) provides global auth context and header
- **Dev server**: Turbopack for fast development (port 3000 by default)
- **Deployment**: Vercel

**Entry point**: `app/` directory (Next.js App Router)

The frontend uses Next.js App Router with Server Components, providing fast development with Turbopack and optimized production builds. All pages have access to Clerk authentication state via the root ClerkProvider.

### Mobile (`apps/mobile`)

**Key architectural components:**

- **Framework**: Expo with expo-router for file-based routing
- **Authentication**: Clerk via `@clerk/clerk-expo` with secure token caching
- **Navigation**: expo-router with Stack and Tabs layouts
- **Theme**: React Navigation theming with dark/light mode support
- **Entry point**: `app/_layout.tsx` - Root layout with ClerkProvider and navigation setup

**App structure:**
- `app/(tabs)/` - Main tab navigation screens
- `app/(auth)/` - Authentication screens (sign-in, sign-up)
- `app/modal.tsx` - Modal screen example

**Running mobile:**
```bash
cd apps/mobile

# Start Expo dev server
pnpm start

# Run on specific platform
pnpm android
pnpm ios
pnpm web
```

## Package Naming

All packages use the scoped naming convention `@manila/<package-name>`:

- `@manila/backend`
- `@manila/frontend`

The mobile app is not scoped but named `mobile` in its package.json.

## Workspace Management

This project uses pnpm workspaces. The workspace configuration is in `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

When adding dependencies:

- Use `pnpm add <package>` in the root to add shared dependencies
- Use `pnpm add <package> --filter @manila/<package-name>` to add dependencies to a specific package
- Workspace packages can reference each other using `workspace:*` protocol

## TypeScript Configuration

Each package has its own `tsconfig.json` with appropriate settings for its environment:
- **Backend**: Node.js environment with ES2022 target and ESNext modules
- **Frontend**: DOM environment with Next.js plugin and path aliases (`@/*`)
- **Mobile**: Expo base config with React Native environment

All packages use strict mode.
