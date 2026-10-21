// Runs the real migrations, seed and verify script on an in-process Postgres (PGlite),
// with a small stand-in for Supabase's auth schema, then checks the access rules as real users.

import { PGlite, type Transaction } from "@electric-sql/pglite";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { runRotationJob, type RotationStore } from "../../lib/rotation-job";

const file = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const MIGRATIONS = ["0001_tables.sql", "0002_functions.sql", "0003_access_rules.sql", "0004_rotation.sql"].map((f) => file(`migrations/${f}`));

/** Same ids as seed.sql: md5('groupme-seed:<key>')::uuid */
const seedId = (key: string) => {
  const h = createHash("md5").update(`groupme-seed:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
const CLASS = seedId("c1:class");
const ALEX = seedId("s-alexr");
const KIM = seedId("t1");
const P2 = seedId("c1:p2");
const P3 = seedId("c1:p3");

let db: PGlite;

async function signUp(email: string, meta: Record<string, unknown>) {
  const res = await db.query<{ id: string }>(
    "insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), $1, $2) returning id",
    [email, JSON.stringify(meta)],
  );
  return res.rows[0].id;
}

/** Runs fn as a signed-in app user (role authenticated + JWT claims), then rolls back. */
async function as<T>(userId: string, fn: (tx: Transaction) => Promise<T>): Promise<T> {
  let out!: T;
  await db.transaction(async (tx) => {
    await tx.exec("set local role authenticated");
    await tx.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: userId, role: "authenticated" })]);
    out = await fn(tx);
    await tx.rollback();
  });
  return out;
}

const count = async (tx: Transaction, sql: string, params: unknown[] = []) =>
  Number((await tx.query<{ n: number }>(`select count(*)::int as n from (${sql}) x`, params)).rows[0].n);

/** True if the statement errors. Uses a savepoint so the rest of the transaction keeps working. */
async function fails(tx: Transaction, sql: string, params: unknown[] = []) {
  await tx.exec("savepoint try_it");
  try {
    await tx.query(sql, params);
    await tx.exec("release savepoint try_it");
    return false;
  } catch {
    await tx.exec("rollback to savepoint try_it");
    return true;
  }
}

const rejects = async (p: Promise<unknown>) => {
  try {
    await p;
    return false;
  } catch {
    return true;
  }
};

beforeAll(async () => {
  db = new PGlite();
  await db.exec(file("tests/auth-stub.sql"));
  // Twice, to prove every file is safe to re-run.
  for (let i = 0; i < 2; i++) for (const sql of MIGRATIONS) await db.exec(sql);
  await db.exec(file("seed.sql"));
  await db.exec(file("seed.sql"));
}, 60_000);

describe("schema + seed", () => {
  it("loads the CS 3A dummy data once, even when the seed runs twice", async () => {
    const n = async (t: string) => Number((await db.query<{ n: number }>(`select count(*)::int n from public.${t}`)).rows[0].n);
    expect(await n("class_members")).toBe(27);
    expect(await n("groups")).toBe(5);
    expect(await n("seats")).toBe(30);
    expect(await n("assignments")).toBe(54);
    expect(await n("projects")).toBe(6);
  });

  it("passes verify.sql once a dev account is set", async () => {
    await signUp("joey.dev@example.com", { name: "Joey", user_type: "student" });
    await db.exec(file("dev-access.sql").replaceAll("YOUR_EMAIL_HERE", "joey.dev@example.com"));
    const rows = (await db.query<{ check: string; result: string }>(file("verify.sql"))).rows;
    expect(rows.filter((r) => r.result !== "ok")).toEqual([]);
    expect(rows.length).toBeGreaterThan(30);
  });
});

describe("sign-up + profiles", () => {
  it("creates the profile from the chosen type and ignores is_dev in the form", async () => {
    const id = await signUp("new.teacher@example.com", { name: "Prof. New", user_type: "admin", is_dev: true });
    const p = (await db.query<{ user_type: string; is_dev: boolean; name: string }>("select * from public.profiles where id = $1", [id])).rows[0];
    expect(p).toMatchObject({ user_type: "admin", is_dev: false, name: "Prof. New" });
  });

  it("won't let users change their own type or dev flag, but they can rename", async () => {
    expect(await as(ALEX, (tx) => fails(tx, "update public.profiles set user_type = 'admin' where id = $1", [ALEX]))).toBe(true);
    expect(await as(ALEX, (tx) => fails(tx, "update public.profiles set is_dev = true where id = $1", [ALEX]))).toBe(true);
    const renamed = await as(ALEX, async (tx) => (await tx.query("update public.profiles set name = 'Alex R' where id = $1", [ALEX])).affectedRows);
    expect(renamed).toBe(1);
  });
});

describe("access rules", () => {
  it("anonymous visitors see nothing", async () => {
    let n = -1;
    await db.transaction(async (tx) => {
      await tx.exec("set local role anon");
      n = await count(tx, "select * from public.classes").catch(() => 0);
      await tx.rollback();
    });
    expect(n).toBe(0);
  });

  it("students see their own class: tables, classmates, posts, role history", async () => {
    const seen = await as(ALEX, async (tx) => ({
      classes: await count(tx, "select * from public.classes"),
      groups: await count(tx, "select * from public.groups"),
      members: await count(tx, "select * from public.class_members"),
      profiles: await count(tx, "select * from public.profiles"),
      posts: await count(tx, "select * from public.posts"),
      history: await count(tx, "select * from public.assignments"),
    }));
    // 27 students + the teacher, and not the unrelated accounts created in other tests.
    expect(seen).toEqual({ classes: 1, groups: 5, members: 27, profiles: 28, posts: 5, history: 54 });
  });

  it("a student outside the class can't see it, and can join only with the right code", async () => {
    const outsider = await signUp("outsider@example.com", { name: "Sky", user_type: "student" });
    await as(outsider, async (tx) => {
      expect(await count(tx, "select * from public.classes")).toBe(0);
      expect(await count(tx, "select * from public.posts")).toBe(0);
      expect(await count(tx, "select * from public.profiles where id <> $1", [outsider])).toBe(0);

      const bad = await tx.query<{ r: unknown }>("select public.join_class_by_code('NOPE00') r");
      expect(bad.rows[0].r).toBeNull();

      const ok = await tx.query<{ r: { already_member: boolean } }>("select public.join_class_by_code(' k7q2mx ') r");
      expect(ok.rows[0].r.already_member).toBe(false);
      const again = await tx.query<{ r: { already_member: boolean } }>("select public.join_class_by_code('K7Q2MX') r");
      expect(again.rows[0].r.already_member).toBe(true);

      expect(await count(tx, "select * from public.groups")).toBe(5);
    });
  });

  it("teachers can't join with a code", async () => {
    expect(await as(KIM, (tx) => fails(tx, "select public.join_class_by_code('K7Q2MX')"))).toBe(true);
  });

  it("students can't post or edit class setup", async () => {
    await as(ALEX, async (tx) => {
      expect(await fails(tx, "insert into public.posts (class_id, type, title) values ($1, 'announcement', 'hi')", [CLASS])).toBe(true);
      expect((await tx.query("update public.groups set name = 'Mine'")).affectedRows).toBe(0);
      expect((await tx.query("delete from public.roles")).affectedRows).toBe(0);
    });
  });

  it("seats: closed while a project runs; when open, students take only empty seats or leave their own", async () => {
    const emptySeat = seedId("c1:g2:seat5");
    const taylorsSeat = seedId("c1:g1:seat0");
    const alexSeat = seedId("c1:g3:seat0");

    // Project 2 is running: switching is closed.
    expect(await as(ALEX, async (tx) => (await tx.query("update public.seats set student_id = null where id = $1", [alexSeat])).affectedRows)).toBe(0);

    await db.query("update public.projects set status = 'done' where id = $1", [P2]);
    try {
      await as(ALEX, async (tx) => {
        expect((await tx.query("update public.seats set student_id = $1 where id = $2", [ALEX, taylorsSeat])).affectedRows).toBe(0);
        expect((await tx.query("update public.seats set student_id = null where id = $1", [alexSeat])).affectedRows).toBe(1);
        expect((await tx.query("update public.seats set student_id = $1 where id = $2", [ALEX, emptySeat])).affectedRows).toBe(1);
        // Only the student column can change.
        expect(await fails(tx, "update public.seats set seat_index = 9 where id = $1", [emptySeat])).toBe(true);
      });
    } finally {
      await db.query("update public.projects set status = 'active' where id = $1", [P2]);
    }
  });

  it("teachers override a role only with a written reason", async () => {
    const sam = seedId("s-samt");
    const docs = seedId("c1:r-docs");
    await as(KIM, async (tx) => {
      expect(await fails(tx, "update public.assignments set role_id = $1, source = 'override', override_reason = '  ' where project_id = $2 and student_id = $3", [docs, P2, sam])).toBe(true);
    });
    const ok = await as(KIM, async (tx) =>
      (await tx.query("update public.assignments set role_id = $1, source = 'override', override_reason = 'Swap agreed at check-in' where project_id = $2 and student_id = $3", [docs, P2, sam])).affectedRows,
    );
    expect(ok).toBe(1);
  });

  it("a teacher can't see or change another teacher's class", async () => {
    const other = await signUp("other.teacher@example.com", { name: "Prof. Other", user_type: "admin" });
    await as(other, async (tx) => {
      expect(await count(tx, "select * from public.classes")).toBe(0);
      expect((await tx.query("update public.posts set title = 'x'")).affectedRows).toBe(0);
    });
  });

  it("app users can't run the rotation function", async () => {
    expect(await as(KIM, (tx) => fails(tx, "select public.apply_rotation($1, '[]'::jsonb)", [P3]))).toBe(true);
  });
});

describe("rotation job against the database", () => {
  // Same queries as lib/rotation-store-supabase.ts, written in SQL for the test database.
  const store: RotationStore = {
    async dueProjects(today) {
      const r = await db.query<{ id: string; class_id: string; number: number; start_date: string }>(
        "select id, class_id, number, start_date::text from public.projects where start_date <= $1 and rotated_at is null", [today]);
      return r.rows.map((p) => ({ id: p.id, classId: p.class_id, number: p.number, startDate: p.start_date }));
    },
    async snapshot(p) {
      const roles = await db.query<{ id: string }>("select id from public.roles where class_id = $1 and not archived order by sort_order", [p.classId]);
      const seats = await db.query<{ group_id: string; allow: boolean; student_id: string | null }>(
        "select g.id group_id, g.allow_shared_roles allow, s.student_id from public.groups g join public.seats s on s.group_id = g.id where g.class_id = $1 order by g.sort_order, s.seat_index", [p.classId]);
      const hist = await db.query<{ student_id: string; role_id: string; number: number }>(
        "select a.student_id, a.role_id, pr.number from public.assignments a join public.projects pr on pr.id = a.project_id where a.class_id = $1", [p.classId]);
      const groups = new Map<string, { id: string; allowSharedRoles: boolean; memberIds: string[] }>();
      for (const s of seats.rows) {
        const g = groups.get(s.group_id) ?? { id: s.group_id, allowSharedRoles: s.allow, memberIds: [] };
        if (s.student_id) g.memberIds.push(s.student_id);
        groups.set(s.group_id, g);
      }
      return {
        roleIds: roles.rows.map((r) => r.id),
        groups: [...groups.values()],
        history: hist.rows.map((h) => ({ studentId: h.student_id, roleId: h.role_id, projectNumber: h.number })),
      };
    },
    async apply(projectId, rows) {
      const r = await db.query<{ ok: boolean }>("select public.apply_rotation($1, $2::jsonb) ok", [projectId, JSON.stringify(rows)]);
      return r.rows[0].ok;
    },
  };

  it("refuses rows that repeat last project's role, and saves nothing", async () => {
    const alexP2 = (await db.query<{ role_id: string; group_id: string }>("select role_id, group_id from public.assignments where project_id = $1 and student_id = $2", [P2, ALEX])).rows[0];
    expect(await rejects(store.apply(P3, [{ group_id: alexP2.group_id, student_id: ALEX, role_id: alexP2.role_id }]))).toBe(true);
    const p3 = (await db.query<{ rotated_at: string | null }>("select rotated_at from public.projects where id = $1", [P3])).rows[0];
    expect(p3.rotated_at).toBeNull();
  });

  it("rotates Project 3 on its start date, once, with no repeat roles", async () => {
    expect((await runRotationJob(store, "2026-11-15")).results).toEqual([]);

    const first = await runRotationJob(store, "2026-11-16");
    expect(first.results).toEqual([{ projectId: P3, status: "rotated", assigned: 27 }]);
    expect((await runRotationJob(store, "2026-11-16")).results).toEqual([]);
    expect(await store.apply(P3, [])).toBe(false);

    const q = (sql: string) => db.query<{ n: number }>(sql, [P3, P2]).then((r) => Number(r.rows[0].n));
    expect(await q("select count(*)::int n from public.assignments where project_id = $1 or (project_id = $2 and false)")).toBe(27);
    expect(await q(`select count(*)::int n from public.assignments a3
                    join public.assignments a2 on a2.student_id = a3.student_id and a2.project_id = $2
                    where a3.project_id = $1 and a3.role_id = a2.role_id`)).toBe(0);
    const statuses = (await db.query<{ number: number; status: string }>("select number, status from public.projects where number <= 3 order by number")).rows;
    expect(statuses.map((s) => s.status)).toEqual(["done", "done", "active"]);
  });
});
