// Daily role rotation. Vercel Cron calls this with "Authorization: Bearer <CRON_SECRET>" (see vercel.json).
// Safe to call more than once: a project is only ever rotated once.

import { timingSafeEqual } from "node:crypto";
import { runRotationJob } from "@/lib/rotation-job";
import { supabaseRotationStore } from "@/lib/rotation-store-supabase";
import { schoolTimeZone, todayIn } from "@/lib/school-time";
import { createAdminClient } from "@/lib/supabase/admin";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const timeZone = schoolTimeZone();
  const report = await runRotationJob(supabaseRotationStore(createAdminClient()), todayIn(timeZone));
  const failed = report.results.some((r) => r.status === "error");
  if (failed) console.error("Rotation job had errors", report);
  return Response.json({ timeZone, ...report }, { status: failed ? 500 : 200 });
}
