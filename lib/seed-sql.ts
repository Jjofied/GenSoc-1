// Builds supabase/seed.sql from lib/mock-data.ts so the database dummy data always matches /demo.
// Regenerate with: npm run db:seed

import { assignments, classes, groups, posts, projects, roles, TEACHER_ID, users } from "./mock-data";

// Mock times have no zone; they're school-local. Default school time zone is Asia/Manila (UTC+8).
const OFFSET = "+08";

const q = (v: string | null | undefined) => (v == null ? "null" : `'${v.replace(/'/g, "''")}'`);
/** Stable UUID from a readable key, so re-running the seed never makes duplicates. */
const id = (key: string) => `md5('groupme-seed:${key}')::uuid`;
const ts = (iso: string) => q(`${iso.replace("T", " ")}${OFFSET}`);
const arr = (items: string[]) => `array[${items.map(q).join(", ")}]::text[]`;

function insert(table: string, cols: string[], rows: string[][], conflict = "(id)") {
  if (rows.length === 0) return "";
  return [
    `insert into ${table} (${cols.join(", ")}) values`,
    rows.map((r) => `  (${r.join(", ")})`).join(",\n"),
    `on conflict ${conflict} do nothing;`,
    "",
  ].join("\n");
}

export function buildSeedSql(): string {
  const cls = classes[0];
  const people = users.filter((u) => u.id === TEACHER_ID || cls.studentIds.includes(u.id));

  const authUsers = insert(
    "auth.users",
    ["instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "raw_app_meta_data",
      "raw_user_meta_data", "created_at", "updated_at", "confirmation_token", "recovery_token", "email_change_token_new", "email_change"],
    people.map((u) => [
      "'00000000-0000-0000-0000-000000000000'", id(u.id), "'authenticated'", "'authenticated'", q(u.email), "''", "now()",
      `'{"provider":"email","providers":["email"]}'::jsonb`,
      `jsonb_build_object('name', ${q(u.name)}, 'user_type', ${q(u.type)})`,
      "now()", "now()", "''", "''", "''", "''",
    ]),
  );

  const profiles = [
    "insert into public.profiles (id, name, user_type) values",
    people.map((u) => `  (${id(u.id)}, ${q(u.name)}, ${q(u.type)})`).join(",\n"),
    "on conflict (id) do update set name = excluded.name, user_type = excluded.user_type;",
    "",
  ].join("\n");

  const P = (key: string) => id(`${cls.id}:${key}`);
  const done = (p: (typeof projects)[number]) => p.status !== "upcoming";

  return [
    "-- groupme · seed · DUMMY DATA ONLY (generated from lib/mock-data.ts — edit that, then run `npm run db:seed`)",
    "-- CS 3A – Software Engineering: Prof. Kim, 27 students, 5 tables, Project 2 of 6 running.",
    "-- Paste into Supabase → SQL Editor → Run, after migrations 0001–0004. Safe to re-run.",
    "-- The dummy people are auth users with no password, so nobody can sign in as them.",
    "",
    "begin;",
    "",
    "-- People (the sign-up trigger also creates their profiles)",
    authUsers,
    profiles,
    "-- Class",
    insert("public.classes", ["id", "name", "section", "term", "invite_code", "admin_id"], [
      [P("class"), q(cls.name), q(cls.section), q(cls.term), q(cls.inviteCode), id(cls.adminId)],
    ]),
    insert("public.class_members", ["class_id", "profile_id"], cls.studentIds.map((s) => [P("class"), id(s)]), "(class_id, profile_id)"),
    "-- Roles",
    insert("public.roles", ["id", "class_id", "name", "icon", "focus", "tasks", "sort_order"],
      roles.map((r, i) => [P(r.id), P("class"), q(r.name), q(r.icon), q(r.focus), arr(r.tasks), String(i)])),
    "-- Projects (1 done, 2 running, 3–6 upcoming)",
    insert("public.projects", ["id", "class_id", "number", "name", "start_date", "due_date", "status", "rotated_at"],
      projects.map((p) => [P(p.id), P("class"), String(p.number), q(p.name), q(p.startDate), q(p.dueDate), q(p.status),
        done(p) ? ts(`${p.startDate}T00:05`) : "null"])),
    "-- Tables and seats",
    insert("public.groups", ["id", "class_id", "name", "allow_shared_roles", "sort_order"],
      groups.map((g, i) => [P(g.id), P("class"), q(g.name), String(g.allowSharedRoles), String(i)])),
    insert("public.seats", ["id", "class_id", "group_id", "seat_index", "student_id"],
      groups.flatMap((g) => g.seats.map((s) => [P(`${g.id}:seat${s.index}`), P("class"), P(g.id), String(s.index), s.studentId ? id(s.studentId) : "null"]))),
    "-- Role history (Project 1 chosen, Project 2 rotated, with two teacher overrides)",
    insert("public.assignments", ["id", "class_id", "project_id", "group_id", "student_id", "role_id", "source", "override_reason"],
      assignments.map((a) => [P(`${a.projectId}:${a.studentId}`), P("class"), P(a.projectId), P(a.groupId), id(a.studentId), P(a.roleId), q(a.source), q(a.overrideReason)])),
    "-- Posts, and calendar events for meetings + deadlines",
    insert("public.posts", ["id", "class_id", "author_id", "type", "title", "body", "posted_at", "attachment_name", "attachment_size", "date_time", "location"],
      posts.map((p) => [P(p.id), P("class"), id(TEACHER_ID), q(p.type), q(p.title), q(p.body), ts(p.postedAt),
        q(p.attachment?.name), q(p.attachment?.size), p.dateTime ? ts(p.dateTime) : "null", q(p.location)])),
    insert("public.events", ["id", "class_id", "type", "title", "start_at", "location", "post_id"],
      posts.filter((p) => (p.type === "meeting" || p.type === "deadline") && p.dateTime).map((p) => [
        P(`ev-${p.id}`), P("class"), q(p.type), q(p.title), ts(p.dateTime!), q(p.location), P(p.id),
      ])),
    "commit;",
    "",
  ].join("\n");
}
