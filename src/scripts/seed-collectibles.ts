/**
 * Seed collectibles — 3 types × 4 rarities = 12 items
 * Usage: npx tsx src/scripts/seed-collectibles.ts
 */
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env manually
const envFile = readFileSync(resolve(process.cwd(), ".env"), "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

const collectibles = [
  // ─── Borders ───────────────────────────────────────────────────────
  { type: "border", slug: "border-stone", name: "Stone Border", description: "Simple stone frame", rarity: "common", obtainMethod: "event" as const, assetUrl: "/collectibles/border-stone.svg" },
  { type: "border", slug: "border-steel", name: "Steel Border", description: "Forged in steel", rarity: "rare", obtainMethod: "purchase" as const, assetUrl: "/collectibles/border-steel.svg" },
  { type: "border", slug: "border-royal", name: "Royal Border", description: "Fit for royalty", rarity: "epic", obtainMethod: "achievement" as const, assetUrl: "/collectibles/border-royal.svg" },
  { type: "border", slug: "border-divine", name: "Divine Border", description: "Radiates divine energy", rarity: "legendary", obtainMethod: "achievement" as const, assetUrl: "/collectibles/border-divine.svg" },

  // ─── Name Styles ───────────────────────────────────────────────────
  { type: "nameStyle", slug: "style-ember", name: "Ember", description: "Warm ember glow", rarity: "common", obtainMethod: "event" as const, styleConfig: { gradient: ["#f97316", "#ef4444"] as [string, string] } },
  { type: "nameStyle", slug: "style-frost", name: "Frost", description: "Icy cold shimmer", rarity: "rare", obtainMethod: "purchase" as const, styleConfig: { gradient: ["#60a5fa", "#06b6d4"] as [string, string] } },
  { type: "nameStyle", slug: "style-neon", name: "Neon", description: "Electric neon glow", rarity: "epic", obtainMethod: "achievement" as const, styleConfig: { gradient: ["#a855f7", "#ec4899"] as [string, string] } },
  { type: "nameStyle", slug: "style-golden", name: "Golden", description: "Pure golden radiance", rarity: "legendary", obtainMethod: "achievement" as const, styleConfig: { gradient: ["#f59e0b", "#fbbf24"] as [string, string] } },

  // ─── Ranks ─────────────────────────────────────────────────────────
  { type: "rank", slug: "rank-novice", name: "Novice", description: "Just getting started", rarity: "common", obtainMethod: "event" as const },
  { type: "rank", slug: "rank-warrior", name: "Warrior", description: "Proven in battle", rarity: "rare", obtainMethod: "achievement" as const },
  { type: "rank", slug: "rank-champion", name: "Champion", description: "Unyielding champion", rarity: "epic", obtainMethod: "achievement" as const },
  { type: "rank", slug: "rank-legendary", name: "Legendary", description: "A living legend", rarity: "legendary", obtainMethod: "achievement" as const },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI not set"); process.exit(1); }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("eliasdex");
  if (!db) { console.error("DB not available"); process.exit(1); }

  const col = db.collection("collectibles");

  let inserted = 0;
  let skipped = 0;

  for (const c of collectibles) {
    const exists = await col.findOne({ slug: c.slug });
    if (exists) {
      skipped++;
      continue;
    }
    await col.insertOne({ ...c, createdAt: new Date() });
    inserted++;
    console.log(`  + ${c.type}/${c.rarity} — ${c.name}`);
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped (existing): ${skipped}`);
  await client.close();
  process.exit(0);
}

main();
