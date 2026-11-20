import { relations } from "drizzle-orm";
import { scrapeJobs, scrapeLogs } from "./schema";

export const scrapeJobsRelations = relations(scrapeJobs, ({ many }) => ({
  logs: many(scrapeLogs),
}));

export const scrapeLogsRelations = relations(scrapeLogs, ({ one }) => ({
  job: one(scrapeJobs, {
    fields: [scrapeLogs.jobId],
    references: [scrapeJobs.id],
  }),
}));
