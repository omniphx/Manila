# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a pnpm monorepo with three main packages:

- **`packages/backend`** - Express-based API server (TypeScript, Node.js)
- **`packages/frontend`** - React web application (Vite, TypeScript)
- **`packages/mobile`** - React Native mobile app (Expo Router, TypeScript)

All packages use TypeScript and share common development tools configured at the root.

## Development Commands

### Running the project

```bash
# Install all dependencies
pnpm install

# Run all packages in development mode (parallel)
pnpm dev

# Run a specific package
pnpm --filter @file-rag-scanner/backend dev
pnpm --filter @file-rag-scanner/frontend dev
pnpm --filter @file-rag-scanner/mobile dev
```

### Building

```bash
# Build all packages
pnpm build

# Build a specific package
pnpm --filter @file-rag-scanner/backend build
pnpm --filter @file-rag-scanner/frontend build
```

### Testing

```bash
# Run tests across all packages
pnpm test

# Run tests for a specific package
pnpm --filter @file-rag-scanner/backend test
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint a specific package
pnpm --filter @file-rag-scanner/frontend lint
```

### Mobile-specific commands

```bash
# Start Expo dev server
pnpm --filter @file-rag-scanner/mobile dev

# Run on iOS simulator
pnpm --filter @file-rag-scanner/mobile ios

# Run on Android emulator
pnpm --filter @file-rag-scanner/mobile android

# Build for production
pnpm --filter @file-rag-scanner/mobile build:ios
pnpm --filter @file-rag-scanner/mobile build:android
```

### Cleaning

```bash
# Remove all node_modules and build artifacts
pnpm clean
```

## Architecture

### Backend (`packages/backend`)

- **Entry point**: `src/index.ts`
- **Build output**: `dist/`
- **Runtime**: Node.js with Express
- **Dev tool**: `tsx` for hot-reloading during development
- **Module system**: ES modules (`type: "module"`)

The backend exposes a `/health` endpoint for health checks and runs on port 3000 by default (configurable via `PORT` env var).

### Frontend (`packages/frontend`)

- **Entry point**: `src/main.tsx`
- **Build output**: `dist/`
- **Dev server**: Vite (port 5173)
- **API proxy**: `/api` routes proxy to `http://localhost:3000` during development

The frontend uses React 18 with TypeScript and Vite for fast development and optimized production builds.

### Mobile (`packages/mobile`)

- **Entry point**: `app/_layout.tsx` (Expo Router)
- **Navigation**: File-based routing via `app/` directory
- **Platforms**: iOS, Android, and Web
- **Dev tool**: Expo CLI

The mobile app uses Expo Router for navigation and supports development on iOS, Android, and web platforms.

## Package Naming

All packages use the scoped naming convention `@file-rag-scanner/<package-name>`:
- `@file-rag-scanner/backend`
- `@file-rag-scanner/frontend`
- `@file-rag-scanner/mobile`

## Workspace Management

This project uses pnpm workspaces. The workspace configuration is in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
```

When adding dependencies:
- Use `pnpm add <package>` in the root to add shared dependencies
- Use `pnpm add <package> --filter @file-rag-scanner/<package-name>` to add dependencies to a specific package
- Workspace packages can reference each other using `workspace:*` protocol

## TypeScript Configuration

Each package has its own `tsconfig.json` with appropriate settings for its environment (Node.js for backend, DOM for frontend, React Native for mobile). All packages use strict mode.
