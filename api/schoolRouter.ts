import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  listSchools,
  getSchoolById,
  getFilters,
  getStats,
  createSchool,
  updateSchool,
  deleteSchool,
  getSchoolsForExport,
} from "./queries/schools";

export const schoolRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          page: z.number().optional(),
          limit: z.number().optional(),
          search: z.string().optional(),
          countries: z.array(z.string()).optional(),
          states: z.array(z.string()).optional(),
          lgas: z.array(z.string()).optional(),
          categories: z.array(z.string()).optional(),
          types: z.array(z.string()).optional(),
          hasContact: z.boolean().optional(),
          sortBy: z.string().optional(),
          sortOrder: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return listSchools(input ?? {});
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getSchoolById(input.id);
    }),

  getFilters: publicQuery.query(async () => {
    return getFilters();
  }),

  getStats: publicQuery.query(async () => {
    return getStats();
  }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        type: z.string().min(1),
        country: z.string().min(1),
        state: z.string().min(1),
        lga: z.string().optional(),
        city: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        principalName: z.string().optional(),
        studentCount: z.number().optional(),
        staffCount: z.number().optional(),
        yearEstablished: z.number().optional(),
        notes: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createSchool({
        ...input,
        scrapedAt: new Date(),
      });
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        type: z.string().optional(),
        country: z.string().optional(),
        state: z.string().optional(),
        lga: z.string().optional(),
        city: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        principalName: z.string().optional(),
        studentCount: z.number().optional(),
        staffCount: z.number().optional(),
        yearEstablished: z.number().optional(),
        notes: z.string().optional(),
        source: z.string().optional(),
        verified: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateSchool(id, data);
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteSchool(input.id);
    }),

  exportCSV: publicQuery
    .input(
      z
        .object({
          countries: z.array(z.string()).optional(),
          states: z.array(z.string()).optional(),
          lgas: z.array(z.string()).optional(),
          categories: z.array(z.string()).optional(),
          types: z.array(z.string()).optional(),
          hasContact: z.boolean().optional(),
          format: z.enum(["standard", "full"]).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const schools = await getSchoolsForExport(input ?? {});

      const format = input?.format ?? "standard";

      const standardHeaders = [
        "School Name",
        "Category",
        "Type",
        "Country",
        "State",
        "LGA",
        "City",
        "Address",
        "Phone",
        "Email",
        "Website",
      ];

      const fullHeaders = [
        ...standardHeaders,
        "Principal Name",
        "Student Count",
        "Staff Count",
        "Year Established",
        "Notes",
        "Source",
        "Scraped At",
        "Verified",
      ];

      const headers = format === "full" ? fullHeaders : standardHeaders;

      const escapeCSV = (val: string | null | undefined) => {
        if (val == null) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = schools.map((school) => {
        const baseRow = [
          school.name,
          school.category,
          school.type,
          school.country,
          school.state,
          school.lga,
          school.city,
          school.address,
          school.phone,
          school.email,
          school.website,
        ];

        if (format === "full") {
          return [
            ...baseRow,
            school.principalName,
            school.studentCount?.toString() ?? "",
            school.staffCount?.toString() ?? "",
            school.yearEstablished?.toString() ?? "",
            school.notes,
            school.source,
            school.scrapedAt?.toISOString() ?? "",
            school.verified ? "Yes" : "No",
          ];
        }

        return baseRow;
      });

      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCSV).join(","))
        .join("\n");

      return csvContent;
    }),
});
