# Manila

A pnpm monorepo containing backend and frontend applications.

## Prerequisites

- Node.js >= 22.16.0
- pnpm >= 10.23.0

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run all packages in development mode:

```bash
pnpm dev
```

## Apps

### Backend (`apps/backend`)

Express-based API server with TypeScript and Node.js.

- Dev server: `pnpm --filter @manila/backend dev`
- Build: `pnpm --filter @manila/backend build`
- Production: `pnpm --filter @manila/backend start`

### Frontend (`apps/frontend`)

React web application built with Vite and TypeScript.

- Dev server: `pnpm --filter @manila/frontend dev`
- Build: `pnpm --filter @manila/frontend build`
- Preview: `pnpm --filter @manila/frontend preview`

## Commands

```bash
# Run all packages in parallel
pnpm dev

# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Clean all dependencies and build artifacts
pnpm clean
```
