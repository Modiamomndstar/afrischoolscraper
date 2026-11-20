import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { listDataSources, createDataSource } from "./queries/schools";

export const sourceRouter = createRouter({
  list: publicQuery.query(async () => {
    return listDataSources();
  }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        country: z.string().optional(),
        category: z.string().optional(),
        reliability: z.number().min(1).max(10).optional(),
        isActive: z.number().optional(),
        requiresJs: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createDataSource(input);
    }),
});
