import { getDb } from "./connection";
import { schools, scrapeJobs, scrapeLogs, dataSources } from "@db/schema";
import {
  eq,
  and,
  or,
  like,
  desc,
  asc,
  sql,
  inArray,
  isNotNull,
  gte,
} from "drizzle-orm";
import type { School, InsertSchool, ScrapeJob } from "@db/schema";

// List schools with pagination and filters
export async function listSchools(params: {
  page?: number;
  limit?: number;
  search?: string;
  countries?: string[];
  states?: string[];
  lgas?: string[];
  categories?: string[];
  types?: string[];
  hasContact?: boolean;
  sortBy?: string;
  sortOrder?: string;
}) {
  const {
    page = 1,
    limit = 25,
    search,
    countries,
    states,
    lgas,
    categories,
    types,
    hasContact,
    sortBy = "created_at",
    sortOrder = "desc",
  } = params;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(schools.name, `%${search}%`),
        like(schools.address, `%${search}%`),
        like(schools.city, `%${search}%`)
      )
    );
  }

  if (countries && countries.length > 0) {
    conditions.push(inArray(schools.country, countries));
  }

  if (states && states.length > 0) {
    conditions.push(inArray(schools.state, states));
  }

  if (lgas && lgas.length > 0) {
    conditions.push(inArray(schools.lga, lgas));
  }

  if (categories && categories.length > 0) {
    conditions.push(inArray(schools.category, categories));
  }

  if (types && types.length > 0) {
    conditions.push(inArray(schools.type, types));
  }

  if (hasContact) {
    conditions.push(
      or(
        isNotNull(schools.phone),
        isNotNull(schools.email),
        isNotNull(schools.website)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderColumn =
    sortBy === "name"
      ? schools.name
      : sortBy === "country"
        ? schools.country
        : sortBy === "category"
          ? schools.category
          : schools.createdAt;

  const orderFn = sortOrder === "asc" ? asc : desc;

  const db = getDb();

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schools)
    .where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  const result = await db
    .select()
    .from(schools)
    .where(whereClause)
    .orderBy(orderFn(orderColumn))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    schools: result,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// Get a single school by ID
export async function getSchoolById(id: number): Promise<School | null> {
  const db = getDb();
  const result = await db.select().from(schools).where(eq(schools.id, id)).limit(1);
  return result[0] ?? null;
}

// Get available filter values
export async function getFilters() {
  const db = getDb();

  const countriesResult = await db
    .selectDistinct({ country: schools.country })
    .from(schools)
    .orderBy(asc(schools.country));

  const statesResult = await db
    .selectDistinct({ state: schools.state })
    .from(schools)
    .orderBy(asc(schools.state));

  const lgasResult = await db
    .selectDistinct({ lga: schools.lga })
    .from(schools)
    .where(isNotNull(schools.lga))
    .orderBy(asc(schools.lga));

  const categoriesResult = await db
    .selectDistinct({ category: schools.category })
    .from(schools)
    .orderBy(asc(schools.category));

  const typesResult = await db
    .selectDistinct({ type: schools.type })
    .from(schools)
    .orderBy(asc(schools.type));

  return {
    countries: countriesResult.map((r) => r.country).filter(Boolean),
    states: statesResult.map((r) => r.state).filter(Boolean),
    lgas: lgasResult.map((r) => r.lga).filter(Boolean),
    categories: categoriesResult.map((r) => r.category).filter(Boolean),
    types: typesResult.map((r) => r.type).filter(Boolean),
  };
}

// Get dashboard statistics
export async function getStats() {
  const db = getDb();

  const totalSchoolsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schools);
  const totalSchools = totalSchoolsResult[0]?.count ?? 0;

  const totalCountriesResult = await db
    .selectDistinct({ country: schools.country })
    .from(schools);
  const totalCountries = totalCountriesResult.length;

  const totalStatesResult = await db
    .selectDistinct({ state: schools.state })
    .from(schools);
  const totalStates = totalStatesResult.length;

  const schoolsByCategory = await db
    .select({
      category: schools.category,
      count: sql<number>`count(*)`,
    })
    .from(schools)
    .groupBy(schools.category)
    .orderBy(desc(sql`count(*)`));

  const schoolsByCountry = await db
    .select({
      country: schools.country,
      count: sql<number>`count(*)`,
    })
    .from(schools)
    .groupBy(schools.country)
    .orderBy(desc(sql`count(*)`));

  const schoolsByType = await db
    .select({
      type: schools.type,
      count: sql<number>`count(*)`,
    })
    .from(schools)
    .groupBy(schools.type)
    .orderBy(desc(sql`count(*)`));

  // Last 7 days additions
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentAdditions = await db
    .select({
      date: sql<string>`date(${schools.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(schools)
    .where(gte(schools.createdAt, sevenDaysAgo))
    .groupBy(sql`date(${schools.createdAt})`)
    .orderBy(asc(sql`date(${schools.createdAt})`));

  // Scraper jobs today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scraperJobsTodayResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(scrapeJobs)
    .where(gte(scrapeJobs.createdAt, today));
  const scraperJobsToday = scraperJobsTodayResult[0]?.count ?? 0;

  return {
    totalSchools,
    totalCountries,
    totalStates,
    schoolsByCategory,
    schoolsByCountry,
    schoolsByType,
    recentAdditions,
    scraperJobsToday,
  };
}

// Create a school
export async function createSchool(data: InsertSchool): Promise<School> {
  const db = getDb();
  const result = await db.insert(schools).values(data).$returningId();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create school");
  const school = await getSchoolById(id);
  if (!school) throw new Error("Failed to fetch created school");
  return school;
}

// Update a school
export async function updateSchool(
  id: number,
  data: Partial<InsertSchool>
): Promise<School> {
  const db = getDb();
  await db.update(schools).set(data).where(eq(schools.id, id));
  const school = await getSchoolById(id);
  if (!school) throw new Error("School not found");
  return school;
}

// Delete a school
export async function deleteSchool(id: number): Promise<boolean> {
  const db = getDb();
  await db.delete(schools).where(eq(schools.id, id));
  return true;
}

// Get schools for CSV export
export async function getSchoolsForExport(params: {
  countries?: string[];
  states?: string[];
  lgas?: string[];
  categories?: string[];
  types?: string[];
  hasContact?: boolean;
}) {
  const { countries, states, lgas, categories, types, hasContact } = params;

  const conditions = [];

  if (countries && countries.length > 0) {
    conditions.push(inArray(schools.country, countries));
  }

  if (states && states.length > 0) {
    conditions.push(inArray(schools.state, states));
  }

  if (lgas && lgas.length > 0) {
    conditions.push(inArray(schools.lga, lgas));
  }

  if (categories && categories.length > 0) {
    conditions.push(inArray(schools.category, categories));
  }

  if (types && types.length > 0) {
    conditions.push(inArray(schools.type, types));
  }

  if (hasContact) {
    conditions.push(
      or(
        isNotNull(schools.phone),
        isNotNull(schools.email),
        isNotNull(schools.website)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const db = getDb();
  return db.select().from(schools).where(whereClause).orderBy(asc(schools.name));
}

// Scrape job queries
export async function listScrapeJobs(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { page = 1, limit = 10, status } = params;
  const db = getDb();

  const conditions = [];
  if (status) {
    conditions.push(eq(scrapeJobs.status, status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(scrapeJobs)
    .where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  const result = await db
    .select()
    .from(scrapeJobs)
    .where(whereClause)
    .orderBy(desc(scrapeJobs.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    jobs: result,
    total,
  };
}

export async function getScrapeJobById(id: number) {
  const db = getDb();
  const result = await db
    .select()
    .from(scrapeJobs)
    .where(eq(scrapeJobs.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getScrapeLogs(jobId: number) {
  const db = getDb();
  return db
    .select()
    .from(scrapeLogs)
    .where(eq(scrapeLogs.jobId, jobId))
    .orderBy(asc(scrapeLogs.timestamp));
}

export async function createScrapeJob(data: {
  name: string;
  query: string;
  targetCountries: string;
  targetCategories?: string;
  targetFields?: string;
  status: string;
}): Promise<ScrapeJob> {
  const db = getDb();
  const result = await db.insert(scrapeJobs).values(data).$returningId();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create scrape job");
  const job = await getScrapeJobById(id);
  if (!job) throw new Error("Failed to fetch created job");
  return job;
}

export async function updateScrapeJob(
  id: number,
  data: Partial<ScrapeJob>
): Promise<void> {
  const db = getDb();
  await db.update(scrapeJobs).set(data).where(eq(scrapeJobs.id, id));
}

export async function addScrapeLog(data: {
  jobId: number;
  level: string;
  message: string;
}): Promise<void> {
  const db = getDb();
  await db.insert(scrapeLogs).values(data);
}

// Data source queries
export async function listDataSources() {
  const db = getDb();
  return db.select().from(dataSources).orderBy(asc(dataSources.name));
}

export async function createDataSource(data: {
  name: string;
  url: string;
  country?: string;
  category?: string;
  reliability?: number;
  isActive?: number;
  requiresJs?: number;
}) {
  const db = getDb();
  const result = await db.insert(dataSources).values(data).$returningId();
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to create data source");
  const sources = await db
    .select()
    .from(dataSources)
    .where(eq(dataSources.id, id))
    .limit(1);
  return sources[0];
}

// Seed data sources
export async function seedDataSources() {
  const db = getDb();
  const existing = await db
    .select({ count: sql<number>`count(*)` })
    .from(dataSources);
  if ((existing[0]?.count ?? 0) > 0) return;

  const defaultSources = [
    {
      name: "Nigeria Federal Ministry of Education",
      url: "https://education.gov.ng",
      country: "Nigeria",
      category: "government",
      reliability: 9,
    },
    {
      name: "Nigerian Universities Commission",
      url: "https://nuc.edu.ng",
      country: "Nigeria",
      category: "tertiary",
      reliability: 9,
    },
    {
      name: "Ghana Education Service",
      url: "https://ges.gov.gh",
      country: "Ghana",
      category: "government",
      reliability: 9,
    },
    {
      name: "Kenya Ministry of Education",
      url: "https://education.go.ke",
      country: "Kenya",
      category: "government",
      reliability: 9,
    },
    {
      name: "South Africa Department of Education",
      url: "https://www.education.gov.za",
      country: "South Africa",
      category: "government",
      reliability: 9,
    },
    {
      name: "Wikipedia - Education in Nigeria",
      url: "https://en.wikipedia.org/wiki/Education_in_Nigeria",
      country: "Nigeria",
      category: "mixed",
      reliability: 7,
    },
    {
      name: "Wikipedia - Education in Ghana",
      url: "https://en.wikipedia.org/wiki/Education_in_Ghana",
      country: "Ghana",
      category: "mixed",
      reliability: 7,
    },
    {
      name: "Wikipedia - Education in Kenya",
      url: "https://en.wikipedia.org/wiki/Education_in_Kenya",
      country: "Kenya",
      category: "mixed",
      reliability: 7,
    },
    {
      name: "Private Schools Nigeria Directory",
      url: "https://schoolscompass.com.ng",
      country: "Nigeria",
      category: "private",
      reliability: 6,
    },
    {
      name: "Schools.ng",
      url: "https://schools.ng",
      country: "Nigeria",
      category: "mixed",
      reliability: 6,
    },
  ];

  for (const source of defaultSources) {
    await db.insert(dataSources).values(source);
  }
}
