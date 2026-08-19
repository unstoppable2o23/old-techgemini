import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const CHUNK_SIZE = 2000;

function norm(name) {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function classifyType(name) {
  const n = name.toLowerCase();
  if (/polytechnic|institute|academy|school/.test(n)) return "Standalone";
  if (/college/.test(n)) return "College";
  return "University";
}

async function main() {
  const file = path.resolve(__dirname, "wikidata-institutions.json");
  const records = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`Wikidata records: ${records.length}`);

  const existingWikidata = await prisma.indianInstitution.count({ where: { source: "wikidata" } });
  if (existingWikidata > 0) {
    console.log(`DB already has ${existingWikidata} wikidata institutions — skipping import.`);
    return;
  }

  const existingNames = new Set(
    (await prisma.indianInstitution.findMany({ select: { name: true } })).map((r) => norm(r.name))
  );
  console.log(`Existing institutions in DB: ${existingNames.size}`);

  const toInsert = [];
  let skippedDuplicateInList = 0;
  const seenInList = new Set();

  for (const r of records) {
    const key = norm(r.name);
    if (existingNames.has(key)) continue;
    if (seenInList.has(key)) {
      skippedDuplicateInList++;
      continue;
    }
    seenInList.add(key);
    toInsert.push({
      wdId: r.wdId,
      name: r.name,
      type: classifyType(r.name),
      state: "",
      district: r.state || null,
      website: r.website,
      yearOfEstablishment: null,
      location: null,
      institutionType: "Wikidata",
      management: null,
      universityAisheCode: null,
      universityName: null,
      source: "wikidata",
    });
  }

  console.log(`New Wikidata institutions to add: ${toInsert.length}`);
  if (toInsert.length === 0) return;

  let created = 0;
  for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
    const chunk = toInsert.slice(i, i + CHUNK_SIZE);
    const result = await prisma.indianInstitution.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    created += result.count;
    console.log(`  chunk ${i + chunk.length}/${toInsert.length} — inserted ${result.count}`);
  }

  console.log(`Import complete. Added ${created} institutions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });