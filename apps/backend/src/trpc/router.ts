import { chatRouter } from "./routers/chat.js";
import { filesRouter } from "./routers/files.js";
import { foldersRouter } from "./routers/folders.js";
import { healthRouter } from "./routers/health.js";
import { router } from "./trpc.js";

export const appRouter = router({
  health: healthRouter,
  files: filesRouter,
  folders: foldersRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
