// Writes supabase/seed.sql from lib/mock-data.ts. Run: npm run db:seed
import { writeFileSync } from "node:fs";
import { buildSeedSql } from "../lib/seed-sql";

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), buildSeedSql());
console.log("Wrote supabase/seed.sql");
