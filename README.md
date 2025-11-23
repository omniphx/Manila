# File RAG Scanner

A pnpm monorepo containing backend, frontend, and mobile applications.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run all packages in development mode:

```bash
pnpm dev
```

## Packages

### Backend (`packages/backend`)

Express-based API server.

- Dev server: `pnpm --filter @file-rag-scanner/backend dev`
- Build: `pnpm --filter @file-rag-scanner/backend build`
- Production: `pnpm --filter @file-rag-scanner/backend start`

### Frontend (`packages/frontend`)

React + Vite web application.

- Dev server: `pnpm --filter @file-rag-scanner/frontend dev`
- Build: `pnpm --filter @file-rag-scanner/frontend build`
- Preview: `pnpm --filter @file-rag-scanner/frontend preview`

### Mobile (`packages/mobile`)

React Native + Expo mobile application.

- Start: `pnpm --filter @file-rag-scanner/mobile dev`
- iOS: `pnpm --filter @file-rag-scanner/mobile ios`
- Android: `pnpm --filter @file-rag-scanner/mobile android`

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
