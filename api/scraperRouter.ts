import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  listScrapeJobs,
  getScrapeJobById,
  getScrapeLogs,
  createScrapeJob,
  updateScrapeJob,
  seedDataSources,
} from "./queries/schools";
import { performScrape } from "./scraper/engine";

export const scraperRouter = createRouter({
  start: publicQuery
    .input(
      z.object({
        name: z.string().optional(),
        query: z.string().min(1),
        targetCountries: z.array(z.string()).min(1),
        targetCategories: z.array(z.string()).optional(),
        targetFields: z.array(z.string()).optional(),
        maxResults: z.number().optional(),
        respectRobots: z.boolean().optional(),
        aiProvider: z.enum(["gemini", "openrouter"]).optional(),
        aiModel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const job = await createScrapeJob({
        name:
          input.name ??
          `Scrape: ${input.query.slice(0, 50)}${input.query.length > 50 ? "..." : ""}`,
        query: input.query,
        targetCountries: JSON.stringify(input.targetCountries),
        targetCategories: input.targetCategories
          ? JSON.stringify(input.targetCategories)
          : undefined,
        targetFields: input.targetFields
          ? JSON.stringify(input.targetFields)
          : undefined,
        status: "queued",
      });

      // Start scraping asynchronously
      performScrape(job.id, {
        query: input.query,
        targetCountries: input.targetCountries,
        targetCategories: input.targetCategories,
        targetFields: input.targetFields,
        maxResults: input.maxResults ?? 50,
        respectRobots: input.respectRobots ?? true,
        aiProvider: input.aiProvider,
        aiModel: input.aiModel,
      }).catch(console.error);

      return { jobId: job.id, message: "Scraping job started" };
    }),


  getJobs: publicQuery
    .input(
      z
        .object({
          page: z.number().optional(),
          limit: z.number().optional(),
          status: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return listScrapeJobs(input ?? {});
    }),

  getJobById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const job = await getScrapeJobById(input.id);
      if (!job) return null;
      const logs = await getScrapeLogs(input.id);
      return { ...job, logs };
    }),

  stopJob: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await updateScrapeJob(input.id, { status: "stopped" });
      return { success: true };
    }),

  getLogs: publicQuery
    .input(
      z.object({
        jobId: z.number(),
        page: z.number().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const logs = await getScrapeLogs(input.jobId);
      return { logs, total: logs.length };
    }),

  seedSources: publicQuery.mutation(async () => {
    await seedDataSources();
    return { success: true };
  }),
});
