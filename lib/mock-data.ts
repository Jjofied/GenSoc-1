// Dummy data only. Names are gender-neutral samples, not real people.
// Matches the low-fi canvas: CS 3A, 5 tables of 6 seats, 27 students, Project 2 of 6 running.

import type { Assignment, Class, Group, Post, Project, Role, User } from "./types";

const CLASS_ID = "c1";

/** The prototype's fixed "today", so dates and phases never drift. */
export const TODAY = "2026-10-21";

export const roles: Role[] = [
  {
    id: "r-lead", classId: CLASS_ID, name: "Team Leader", icon: "★",
    focus: "Plans, assigns, keeps the group on track",
    tasks: ["Split the work and set weekly goals", "Run the check-in meetings", "Flag blockers to the teacher early"],
  },
  {
    id: "r-prog", classId: CLASS_ID, name: "Lead Programmer", icon: "</>",
    focus: "Builds the main code",
    tasks: ["Set up the repo and code structure", "Build the core features", "Review teammates' code"],
  },
  {
    id: "r-design", classId: CLASS_ID, name: "System Designer", icon: "◫",
    focus: "Plans screens, flow, structure",
    tasks: ["Sketch the screens and user flow", "Plan the data and structure", "Keep the design consistent"],
  },
  {
    id: "r-test", classId: CLASS_ID, name: "Debugger & Tester", icon: "✓",
    focus: "Finds and reports bugs, checks it works",
    tasks: ["Write test cases for each feature", "Log bugs and check fixes", "Full test pass before the demo"],
  },
  {
    id: "r-docs", classId: CLASS_ID, name: "Documenter", icon: "¶",
    focus: "Writes docs, notes, reports",
    tasks: ["Take notes at every check-in", "Write the user guide and report", "Keep the docs in sync with the code"],
  },
  {
    id: "r-present", classId: CLASS_ID, name: "Presenter", icon: "▶",
    focus: "Presents the work to class",
    tasks: ["Build the demo script and slides", "Rehearse with the group", "Present on demo day"],
  },
];
const R = roles.map((r) => r.id);

export const TEACHER_ID = "t1";

// Table members in seat order. Table 2 and Table 5 have empty seats.
const tables: { name: string; members: string[]; offset: number }[] = [
  { name: "Table 1", members: ["Taylor K.", "Jamie S.", "Avery B.", "Quinn H.", "Rowan F.", "Skyler N."], offset: 1 },
  { name: "Table 2", members: ["Drew C.", "Reese W.", "Parker J.", "Emerson G.", "Hayden V."], offset: 2 },
  { name: "Table 3", members: ["Alex R.", "Sam T.", "Jordan L.", "Casey M.", "Riley P.", "Morgan D."], offset: 0 },
  { name: "Table 4", members: ["Kai O.", "Logan E.", "Sage Y.", "Dakota I.", "Finley U.", "Remy A."], offset: 4 },
  { name: "Table 5", members: ["Charlie Z.", "Jesse Q.", "Ellis N.", "Robin T."], offset: 5 },
];
const SEATS_PER_TABLE = 6;

const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, "");

const studentUsers: User[] = tables.flatMap((t) =>
  t.members.map((name): User => ({
    id: `s-${slug(name)}`,
    name,
    email: `${slug(name)}@school.example.edu`,
    type: "student",
    classIds: name === "Alex R." ? [CLASS_ID, "c2"] : [CLASS_ID],
  })),
);

export const users: User[] = [
  { id: TEACHER_ID, name: "Prof. Kim", email: "kim@school.example.edu", type: "admin", classIds: [CLASS_ID] },
  { id: "t2", name: "Prof. Lee", email: "lee@school.example.edu", type: "admin", classIds: ["c2"] },
  ...studentUsers,
];

export const ME_ID = "s-alexr";

export const classes: Class[] = [
  {
    id: CLASS_ID,
    name: "CS 3A – Software Engineering",
    section: "3A",
    term: "1st Sem AY 2026–27",
    inviteCode: "K7Q2MX",
    adminId: TEACHER_ID,
    studentIds: studentUsers.map((u) => u.id),
  },
  // Only used for the "already joined" state on WF02 and the class switcher.
  { id: "c2", name: "CS 2B – Data Structures", section: "2B", term: "1st Sem AY 2026–27", inviteCode: "D5S2BT", adminId: "t2", studentIds: [ME_ID] },
];

export const projects: Project[] = [
  { id: "p1", classId: CLASS_ID, number: 1, name: "Library System", startDate: "2026-08-17", dueDate: "2026-10-02", status: "done" },
  { id: "p2", classId: CLASS_ID, number: 2, name: "Clinic Booking App", startDate: "2026-10-05", dueDate: "2026-10-30", status: "active" },
  { id: "p3", classId: CLASS_ID, number: 3, name: "Inventory API", startDate: "2026-11-16", dueDate: "2026-12-11", status: "upcoming" },
  { id: "p4", classId: CLASS_ID, number: 4, name: "Event Ticketing", startDate: "2027-01-11", dueDate: "2027-02-05", status: "upcoming" },
  { id: "p5", classId: CLASS_ID, number: 5, name: "Study Planner", startDate: "2027-02-15", dueDate: "2027-03-12", status: "upcoming" },
  { id: "p6", classId: CLASS_ID, number: 6, name: "Final Showcase", startDate: "2027-03-22", dueDate: "2027-04-23", status: "upcoming" },
];

export const groups: Group[] = tables.map((t, gi) => ({
  id: `g${gi + 1}`,
  classId: CLASS_ID,
  name: t.name,
  allowSharedRoles: true,
  seats: Array.from({ length: SEATS_PER_TABLE }, (_, index) => ({
    index,
    studentId: t.members[index] ? `s-${slug(t.members[index])}` : null,
  })),
}));

// Table 3 follows the canvas exactly. Other tables use a simple pattern that never repeats a role.
const table3: Record<"p1" | "p2", string[]> = {
  p1: ["r-prog", "r-lead", "r-docs", "r-design", "r-present", "r-test"],
  p2: ["r-test", "r-present", "r-lead", "r-prog", "r-design", "r-docs"],
};

const overrides: Record<string, string> = {
  "s-morgand": "Morgan asked to switch for this project. Approved after a table check-in.",
  "s-kaio": "Moved to balance the table after a member changed sections.",
};

export const assignments: Assignment[] = tables.flatMap((t, gi) =>
  (["p1", "p2"] as const).flatMap((projectId) =>
    t.members.map((name, i): Assignment => {
      const studentId = `s-${slug(name)}`;
      const roleId =
        t.name === "Table 3"
          ? table3[projectId][i]
          : R[(i + t.offset + (projectId === "p1" ? 3 : 0)) % R.length];
      const overridden = projectId === "p2" && overrides[studentId];
      return {
        projectId,
        groupId: `g${gi + 1}`,
        studentId,
        roleId,
        source: projectId === "p1" ? "chosen" : overridden ? "override" : "rotated",
        ...(overridden ? { overrideReason: overrides[studentId] } : {}),
      };
    }),
  ),
);

export const posts: Post[] = [
  {
    id: "post-demo", classId: CLASS_ID, type: "deadline", title: "Clinic app demo",
    body: "Each table demos the booking flow. 10 minutes per table.",
    postedAt: "2026-10-06T09:00", dateTime: "2026-10-30T13:00", location: "Room 304",
  },
  {
    id: "post-l08", classId: CLASS_ID, type: "file", title: "Lecture 8 — Unit testing",
    body: "Slides from Thursday's lecture.", postedAt: "2026-10-16T10:00",
    attachment: { name: "L08_UnitTesting.pdf", size: "2.1 MB" },
  },
  {
    id: "post-checkin", classId: CLASS_ID, type: "meeting", title: "Sprint check-in moved to Room 304",
    body: "Bring your table's progress board.", postedAt: "2026-10-19T08:30",
    dateTime: "2026-10-22T14:00", location: "Room 304 · meet link",
    attachment: { name: "Sprint_Checklist.pdf", size: "180 KB" },
  },
  {
    id: "post-template", classId: CLASS_ID, type: "file", title: "Test plan template",
    body: "Use this for Friday's test plan.", postedAt: "2026-10-20T09:00",
    attachment: { name: "TestPlan_Template.docx", size: "42 KB" },
  },
  {
    id: "post-testplan", classId: CLASS_ID, type: "deadline", title: "Test plan due Friday",
    body: "One test plan per table. Submit it here in Posts.", postedAt: "2026-10-20T09:05",
    dateTime: "2026-10-23T23:59", location: "Submit in Posts",
    attachment: { name: "TestPlan_Template.docx", size: "42 KB" },
  },
];

export const NEW_ROLE_GLYPHS = ["◆", "◎", "✦", "☰", "⌂", "◇"];
