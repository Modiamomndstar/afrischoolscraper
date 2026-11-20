import { getDb } from "../api/queries/connection";
import { schools, dataSources } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Check if data already exists
  const existing = await db.select({ count: schools.id }).from(schools).limit(1);
  if (existing.length > 0) {
    console.log("Data already exists, skipping seed.");
    return;
  }

  // Seed sample schools
  const sampleSchools = [
    {
      name: "Queen's College",
      category: "secondary",
      type: "public",
      country: "Nigeria",
      state: "Lagos",
      lga: "Yaba",
      city: "Lagos",
      address: "Jeremiah Ugwu Street, Yaba",
      phone: "+234 1 774 1234",
      website: "https://queenscollegelagos.com",
      notes: "Federal government girls college founded in 1927",
      scrapedAt: new Date(),
    },
    {
      name: "King's College",
      category: "secondary",
      type: "public",
      country: "Nigeria",
      state: "Lagos",
      lga: "Lagos Island",
      city: "Lagos",
      address: "3 Catholic Mission Street, Lagos Island",
      phone: "+234 1 266 8029",
      website: "https://kingscollegelagos.com",
      notes: "Premier secondary school in Nigeria founded in 1909",
      scrapedAt: new Date(),
    },
    {
      name: "Federal Government College Ikorodu",
      category: "secondary",
      type: "public",
      country: "Nigeria",
      state: "Lagos",
      lga: "Ikorodu",
      city: "Ikorodu",
      address: "College Road, Ikorodu",
      phone: "+234 802 345 6789",
      notes: "Federal unity college",
      scrapedAt: new Date(),
    },
    {
      name: "University of Lagos",
      category: "tertiary",
      type: "public",
      country: "Nigeria",
      state: "Lagos",
      lga: "Akoka",
      city: "Lagos",
      address: "Akoka, Yaba",
      phone: "+234 1 280 2438",
      email: "info@unilag.edu.ng",
      website: "https://unilag.edu.ng",
      studentCount: 50000,
      yearEstablished: 1962,
      notes: "Premier university in Nigeria",
      scrapedAt: new Date(),
    },
    {
      name: "University of Ibadan",
      category: "tertiary",
      type: "public",
      country: "Nigeria",
      state: "Oyo",
      lga: "Ibadan North",
      city: "Ibadan",
      address: "Oduduwa Road, Ibadan",
      phone: "+234 2 810 1733",
      email: "registry@ui.edu.ng",
      website: "https://ui.edu.ng",
      studentCount: 35000,
      yearEstablished: 1948,
      notes: "Nigeria's first university",
      scrapedAt: new Date(),
    },
    {
      name: "Obafemi Awolowo University",
      category: "tertiary",
      type: "public",
      country: "Nigeria",
      state: "Osun",
      lga: "Ife Central",
      city: "Ile-Ife",
      address: "OAU Campus, Ile-Ife",
      phone: "+234 36 230 123",
      email: "info@oauife.edu.ng",
      website: "https://oauife.edu.ng",
      studentCount: 30000,
      yearEstablished: 1961,
      notes: "Previously University of Ife",
      scrapedAt: new Date(),
    },
    {
      name: "Loyola Jesuit College",
      category: "secondary",
      type: "private",
      country: "Nigeria",
      state: "Abuja",
      lga: "Abaji",
      city: "Abuja",
      address: "Gidan Mangoro, Abuja",
      phone: "+234 9 234 5678",
      email: "info@loyolajesuit.org",
      website: "https://loyolajesuit.org",
      notes: "Prestigious Jesuit boarding school",
      scrapedAt: new Date(),
    },
    {
      name: "Atlantic Hall School",
      category: "secondary",
      type: "private",
      country: "Nigeria",
      state: "Lagos",
      lga: "Epe",
      city: "Epe",
      address: "Poka, Epe",
      phone: "+234 1 773 4567",
      email: "info@atlantichallsschool.com",
      website: "https://atlantichallsschool.com",
      notes: "Top private co-educational school",
      scrapedAt: new Date(),
    },
    {
      name: "Christ the King College",
      category: "secondary",
      type: "public",
      country: "Nigeria",
      state: "Anambra",
      lga: "Onitsha North",
      city: "Onitsha",
      address: "33 Oguta Road, Onitsha",
      phone: "+234 46 231 234",
      notes: "One of the oldest schools in Eastern Nigeria",
      scrapedAt: new Date(),
    },
    {
      name: "Accra Academy",
      category: "secondary",
      type: "public",
      country: "Ghana",
      state: "Greater Accra",
      lga: "Accra Metro",
      city: "Accra",
      address: "Bubuashie, Accra",
      phone: "+233 30 2 231 234",
      website: "https://accraacademy.edu.gh",
      notes: "One of the oldest secondary schools in Ghana",
      scrapedAt: new Date(),
    },
    {
      name: "Mfantsipim School",
      category: "secondary",
      type: "public",
      country: "Ghana",
      state: "Central",
      lga: "Cape Coast",
      city: "Cape Coast",
      address: "Cape Coast",
      phone: "+233 33 213 3456",
      notes: "Prestigious Methodist boys school",
      scrapedAt: new Date(),
    },
    {
      name: "University of Ghana",
      category: "tertiary",
      type: "public",
      country: "Ghana",
      state: "Greater Accra",
      lga: "Legon",
      city: "Accra",
      address: "Legon, Accra",
      phone: "+233 30 250 0381",
      email: "pro-vice@ug.edu.gh",
      website: "https://ug.edu.gh",
      studentCount: 40000,
      yearEstablished: 1948,
      notes: "Ghana's largest university",
      scrapedAt: new Date(),
    },
    {
      name: "Alliance High School",
      category: "secondary",
      type: "public",
      country: "Kenya",
      state: "Kiambu",
      lga: "Kikuyu",
      city: "Kikuyu",
      address: "Kikuyu",
      phone: "+254 20 204 1234",
      website: "https://alliancehighschool.sc.ke",
      notes: "One of the oldest and most prestigious schools in Kenya",
      scrapedAt: new Date(),
    },
    {
      name: "University of Nairobi",
      category: "tertiary",
      type: "public",
      country: "Kenya",
      state: "Nairobi",
      lga: "Nairobi Central",
      city: "Nairobi",
      address: "University Way, Nairobi",
      phone: "+254 20 491 0000",
      email: "vc@uonbi.ac.ke",
      website: "https://uonbi.ac.ke",
      studentCount: 60000,
      yearEstablished: 1956,
      notes: "Kenya's largest university",
      scrapedAt: new Date(),
    },
    {
      name: "Hilton College",
      category: "secondary",
      type: "private",
      country: "South Africa",
      state: "KwaZulu-Natal",
      lga: "uMngeni",
      city: "Hilton",
      address: "Hilton",
      phone: "+27 33 383 0126",
      website: "https://hiltoncollege.com",
      notes: "Prestigious private boarding school",
      scrapedAt: new Date(),
    },
  ];

  for (const school of sampleSchools) {
    await db.insert(schools).values(school);
  }
  console.log(`Seeded ${sampleSchools.length} schools.`);

  // Seed data sources
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
      name: "Wikipedia - Education in Nigeria",
      url: "https://en.wikipedia.org/wiki/Education_in_Nigeria",
      country: "Nigeria",
      category: "mixed",
      reliability: 7,
    },
  ];

  for (const source of defaultSources) {
    await db.insert(dataSources).values(source);
  }
  console.log(`Seeded ${defaultSources.length} data sources.`);
}

seed()
  .then(() => {
    console.log("Seed completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
