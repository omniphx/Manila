import { router } from './trpc.js';
import { healthRouter } from './routers/health.js';
import { authRouter } from './routers/auth.js';
import { embeddingsRouter } from './routers/embeddings.js';

export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  embeddings: embeddingsRouter,
});

export type AppRouter = typeof appRouter;
