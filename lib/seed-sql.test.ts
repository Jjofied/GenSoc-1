import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildSeedSql } from "./seed-sql";

describe("supabase/seed.sql", () => {
  it("is up to date with lib/mock-data.ts (run `npm run db:seed` if this fails)", () => {
    expect(readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8")).toBe(buildSeedSql());
  });

  it("has no gender data", () => {
    expect(buildSeedSql()).not.toMatch(/gender/i);
  });
});
