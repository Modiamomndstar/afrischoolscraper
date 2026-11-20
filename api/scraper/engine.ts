import { updateScrapeJob, addScrapeLog, createSchool } from "../queries/schools";
import { getDb } from "../queries/connection";
import { schools } from "@db/schema";
import { like, and, sql } from "drizzle-orm";
import { extractStructuredData, AIProvider, normalizeLocation } from "../lib/ai";


interface ScrapeOptions {
  query: string;
  targetCountries: string[];
  targetCategories?: string[];
  targetFields?: string[];
  maxResults: number;
  respectRobots: boolean;
  aiProvider?: AIProvider;
  aiModel?: string;
}

interface ScrapedSchool {
  name: string;
  category: string;
  type: string;
  country: string;
  state: string;
  lga?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  studentCount?: number;
  staffCount?: number;
  yearEstablished?: number;
  notes?: string;
  source?: string;
}

const activeJobs = new Map<number, boolean>();

export async function performScrape(
  jobId: number,
  options: ScrapeOptions
): Promise<void> {
  activeJobs.set(jobId, true);

  try {
    await updateScrapeJob(jobId, {
      status: "running",
      startedAt: new Date(),
      progress: 5,
    });

    await addScrapeLog({
      jobId,
      level: "info",
      message: `Job ${jobId}: Starting real-world AI scrape for "${options.query}"`,
    });

    let totalFound = 0;
    let totalAdded = 0;

    // Phase 1: Search Integration
    await addScrapeLog({
      jobId,
      level: "info",
      message: `Phase 1/3: Searching the web using ${process.env.SERPER_API_KEY ? "Serper.dev" : "fallback engine"}...`,
    });

    const searchResults = await getSearchResults(options);

    if (searchResults.length === 0) {
       await addScrapeLog({
        jobId,
        level: "warning",
        message: "No search results found. Falling back to targeted source list.",
      });
      // Fallback to basic generation or predefined sources
    }

    await addScrapeLog({
      jobId,
      level: "info",
      message: `Phase 2/3: Processing ${searchResults.length} data sources with AI extraction...`,
    });

    for (let i = 0; i < searchResults.length; i++) {
      if (!activeJobs.get(jobId)) {
        await addScrapeLog({ jobId, level: "info", message: "Job stopped by user" });
        await updateScrapeJob(jobId, { status: "stopped" });
        return;
      }

      const result = searchResults[i];
      const progress = Math.round(5 + ((i + 1) / searchResults.length) * 85);
      await updateScrapeJob(jobId, { progress });

      await addScrapeLog({
        jobId,
        level: "info",
        message: `Analyzing source: ${result.title} (${result.url})`,
      });

      try {
        const extracted = await extractFromSource(result, options);
        
        for (const school of extracted) {
          if (totalAdded >= options.maxResults) break;
          
          const isDuplicate = await checkDuplicate(school);
          if (!isDuplicate) {
            // Normalize location
            const normalized = await normalizeLocation(
              `${school.city || ""} ${school.state} ${school.lga || ""}`, 
              school.country,
              options.aiProvider
            );

            await createSchool({
              ...school,
              ...normalized,
              source: result.url,
              scrapedAt: new Date(),
            });
            totalAdded++;
          }

          totalFound++;
        }

        await addScrapeLog({
          jobId,
          level: "info",
          message: `Successfully extracted ${extracted.length} records from this source.`,
        });

        await delay(1000); // Politeness delay
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await addScrapeLog({
          jobId,
          level: "warning",
          message: `Source failed: ${msg}`,
        });
      }

      if (totalAdded >= options.maxResults) break;
    }

    // Phase 3: Finalization
    await updateScrapeJob(jobId, {
      status: "completed",
      schoolsFound: totalFound,
      schoolsAdded: totalAdded,
      completedAt: new Date(),
      progress: 100,
    });

    await addScrapeLog({
      jobId,
      level: "info",
      message: `Scrape completed! Found ${totalFound} schools, added ${totalAdded} new records.`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await updateScrapeJob(jobId, {
      status: "failed",
      errorMessage: errorMsg,
    });
    await addScrapeLog({
      jobId,
      level: "error",
      message: `Scrape failed: ${errorMsg}`,
    });
  } finally {
    activeJobs.delete(jobId);
  }
}

async function getSearchResults(options: ScrapeOptions): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    // Basic fallback logic
    return [
      { title: `List of schools in ${options.targetCountries[0]}`, url: `https://en.wikipedia.org/wiki/List_of_schools_in_${options.targetCountries[0]}`, snippet: "Wiki list" }
    ];
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        q: `${options.query} ${options.targetCountries.join(" ")}`,
        num: 10
      })
    });
    
    const data = await response.json();
    return data.organic?.map((res: any) => ({
      title: res.title,
      url: res.link,
      snippet: res.snippet
    })) || [];
  } catch (e) {
    console.error("Search failed:", e);
    return [];
  }
}

async function extractFromSource(
  result: SearchResult,
  options: ScrapeOptions
): Promise<ScrapedSchool[]> {
  try {
    const response = await fetch(result.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });

    if (!response.ok) throw new Error(`Could not fetch ${result.url}`);

    const html = await response.text();
    const cleanContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 10000);

    const schema = `
      Array<{
        name: string,
        category: "primary" | "secondary" | "tertiary" | "vocational",
        type: "public" | "private" | "faith_based",
        country: string,
        state: string,
        lga?: string,
        city?: string,
        address?: string,
        phone?: string,
        email?: string,
        website?: string,
        principalName?: string,
        studentCount?: number,
        staffCount?: number,
        yearEstablished?: number,
        notes?: string
      }>
    `;

    return await extractStructuredData<ScrapedSchool[]>(
      cleanContent, 
      schema, 
      options.aiProvider || "gemini",
      options.aiModel
    );
  } catch (e) {
    console.error(`AI Extraction failed for ${result.url}:`, e);
    return [];
  }
}

async function checkDuplicate(school: ScrapedSchool): Promise<boolean> {
  const db = getDb();
  const searchName = school.name.slice(0, 20);
  const existing = await db
    .select({ count: sql<number>`count(*)` })
    .from(schools)
    .where(
      and(
        like(schools.name, `%${searchName}%`),
        like(schools.state, `%${school.state || ""}%`)
      )
    )
    .limit(1);
  return (existing[0]?.count ?? 0) > 0;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}
