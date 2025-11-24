# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo with two main packages:

- **`apps/backend`** - Express-based API server (TypeScript, Node.js)
- **`apps/frontend`** - Next.js web application (TypeScript, React)

All packages use TypeScript and share common development tools configured at the root.

## Getting Started

### Initial Setup

```bash
# Install all dependencies
pnpm install
```

### Environment Variables (Vercel)

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
```

## Architecture

### Backend (`apps/backend`)

- **Entry point**: `src/index.ts`
- **Build output**: `dist/`
- **Runtime**: Node.js with Express
- **Dev tool**: `tsx` for hot-reloading during development
- **Module system**: ES modules (`type: "module"`)

The backend exposes a `/health` endpoint for health checks and runs on port 3000 by default (configurable via `PORT` env var).

### Frontend (`apps/frontend`)

- **Entry point**: `app/` (Next.js App Router)
- **Build output**: `.next/`
- **Dev server**: Next.js with Turbopack (port 3000 by default)
- **Framework**: Next.js 16 with React 19 and TypeScript
- **Authentication**: Clerk (via `@clerk/nextjs`)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

The frontend uses Next.js App Router with Server Components, providing fast development with Turbopack and optimized production builds. Authentication is handled by Clerk.

## Package Naming

All packages use the scoped naming convention `@manila/<package-name>`:

- `@manila/backend`
- `@manila/frontend`

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

Each package has its own `tsconfig.json` with appropriate settings for its environment (Node.js for backend, DOM for frontend, React Native for mobile). All packages use strict mode.
