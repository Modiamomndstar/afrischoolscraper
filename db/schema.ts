import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  index,
} from "drizzle-orm/mysql-core";

// Primary table storing all collected school records
export const schools = mysqlTable(
  "schools",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    lga: varchar("lga", { length: 100 }),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    phone: varchar("phone", { length: 200 }),
    email: varchar("email", { length: 200 }),
    website: varchar("website", { length: 500 }),
    principalName: varchar("principal_name", { length: 200 }),
    studentCount: int("student_count"),
    staffCount: int("staff_count"),
    yearEstablished: int("year_established"),
    notes: text("notes"),
    source: text("source"),
    scrapedAt: timestamp("scraped_at"),
    verified: int("verified").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("name_idx").on(table.name),
    countryIdx: index("country_idx").on(table.country),
    stateIdx: index("state_idx").on(table.state),
    lgaIdx: index("lga_idx").on(table.lga),
    categoryIdx: index("category_idx").on(table.category),
    typeIdx: index("type_idx").on(table.type),
  })
);

// Tracks scraping job sessions
export const scrapeJobs = mysqlTable(
  "scrape_jobs",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    query: text("query").notNull(),
    targetCountries: text("target_countries").notNull(),
    targetCategories: text("target_categories"),
    targetFields: text("target_fields"),
    sources: text("sources"),
    status: varchar("status", { length: 50 }).notNull(),
    schoolsFound: int("schools_found").default(0),
    schoolsAdded: int("schools_added").default(0),
    errorMessage: text("error_message"),
    progress: int("progress").default(0),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("status_idx").on(table.status),
  })
);

// Detailed logs for each scraping job
export const scrapeLogs = mysqlTable(
  "scrape_logs",
  {
    id: serial("id").primaryKey(),
    jobId: int("job_id").notNull(),
    level: varchar("level", { length: 20 }).notNull(),
    message: text("message").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    jobIdIdx: index("job_id_idx").on(table.jobId),
  })
);

// Pre-configured and discovered scraping sources
export const dataSources = mysqlTable("data_sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  country: varchar("country", { length: 100 }),
  category: varchar("category", { length: 100 }),
  reliability: int("reliability").default(5),
  lastScraped: timestamp("last_scraped"),
  schoolsFound: int("schools_found").default(0),
  isActive: int("is_active").default(1),
  requiresJs: int("requires_js").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type inference
export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;
export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type InsertScrapeJob = typeof scrapeJobs.$inferInsert;
export type ScrapeLog = typeof scrapeLogs.$inferSelect;
export type InsertScrapeLog = typeof scrapeLogs.$inferInsert;
export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = typeof dataSources.$inferInsert;
