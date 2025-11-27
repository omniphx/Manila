import { embeddingsRouter } from "./routers/embeddings.js";
import { filesRouter } from "./routers/files.js";
import { healthRouter } from "./routers/health.js";
import { router } from "./trpc.js";

export const appRouter = router({
  health: healthRouter,
  embeddings: embeddingsRouter,
  files: filesRouter,
});

export type AppRouter = typeof appRouter;
