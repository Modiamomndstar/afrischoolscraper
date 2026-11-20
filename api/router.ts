import { createRouter, publicQuery } from "./middleware";
import { schoolRouter } from "./schoolRouter";
import { scraperRouter } from "./scraperRouter";
import { sourceRouter } from "./sourceRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  school: schoolRouter,
  scraper: scraperRouter,
  source: sourceRouter,
});

export type AppRouter = typeof appRouter;
