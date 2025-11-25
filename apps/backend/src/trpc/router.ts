import { embeddingsRouter } from "./routers/embeddings.js";
import { healthRouter } from "./routers/health.js";
import { router } from "./trpc.js";

export const appRouter = router({
  health: healthRouter,
  embeddings: embeddingsRouter,
});

export type AppRouter = typeof appRouter;
