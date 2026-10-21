// Dummy data only. Names are gender-neutral samples, not real people.

import { rotateRoles } from "./rotation";
import type {
  Assignment,
  CalendarEvent,
  Class,
  Group,
  GroupStatus,
  Post,
  Project,
  Role,
  RoleHistory,
  Seat,
  User,
  UserType,
} from "./types";

const CLASS_ID = "c1";

export const roles: Role[] = [
  { id: "r-lead", classId: CLASS_ID, name: "Team Leader", focus: "Plans, assigns, keeps the group on track" },
  { id: "r-prog", classId: CLASS_ID, name: "Lead Programmer", focus: "Builds the main code" },
  { id: "r-design", classId: CLASS_ID, name: "System Designer", focus: "Plans screens, flow, structure" },
  { id: "r-test", classId: CLASS_ID, name: "Debugger & Tester", focus: "Finds and reports bugs, checks it works" },
  { id: "r-docs", classId: CLASS_ID, name: "Documenter", focus: "Writes docs, notes, reports" },
  { id: "r-present", classId: CLASS_ID, name: "Presenter", focus: "Presents the work to class" },
];
const ROLE_IDS = roles.map((r) => r.id);

const studentNames = [
  "Alex R.", "Sam T.", "Jordan L.", "Casey M.", "Riley P.", "Morgan D.",
  "Taylor B.", "Jamie C.", "Quinn S.", "Drew H.", "Skyler V.",
];

export const users: User[] = [
  { id: "admin1", name: "Prof. Rowan K.", email: "rowan.k@example.edu", type: "admin", classIds: [CLASS_ID] },
  ...studentNames.map((name, i): User => ({
    id: `s${i + 1}`,
    name,
    email: `student${i + 1}@example.edu`,
    type: "student",
    classIds: [CLASS_ID],
  })),
];

export const classes: Class[] = [
  {
    id: CLASS_ID,
    name: "CS 3A – Software Engineering",
    section: "3A",
    term: "1st Sem 2026–27",
    inviteCode: "GRP4K7",
    adminId: "admin1",
    studentIds: users.filter((u) => u.type === "student").map((u) => u.id),
  },
];

export const projects: Project[] = [
  { id: "p1", classId: CLASS_ID, number: 1, name: "Project 1 – Requirements & Prototype", startDate: "2026-08-17", dueDate: "2026-09-11", status: "done" },
  { id: "p2", classId: CLASS_ID, number: 2, name: "Project 2 – Core Features", startDate: "2026-09-14", dueDate: "2026-10-09", status: "done" },
  { id: "p3", classId: CLASS_ID, number: 3, name: "Project 3 – Testing & Release", startDate: "2026-10-12", dueDate: "2026-11-06", status: "active" },
];

export const currentProject = projects.find((p) => p.status === "active")!;

export function groupStatus(seats: Seat[], projectStarted: boolean): GroupStatus {
  if (seats.every((s) => s.studentId !== null)) return "full";
  return projectStarted ? "not-full-started" : "open";
}

function makeGroup(id: string, name: string, memberIds: string[], seatCount: number): Group {
  const seats: Seat[] = Array.from({ length: seatCount }, (_, index) => ({
    index,
    studentId: memberIds[index] ?? null,
  }));
  return {
    id,
    classId: CLASS_ID,
    name,
    seats,
    roleIds: ROLE_IDS,
    allowSharedRoles: true,
    status: groupStatus(seats, currentProject.status === "active"),
  };
}

// Group A is full. Group B has an empty seat after the project started, so it shows an admin alert.
export const groups: Group[] = [
  makeGroup("g1", "Table A", ["s1", "s2", "s3", "s4", "s5", "s6"], 6),
  makeGroup("g2", "Table B", ["s7", "s8", "s9", "s10", "s11"], 6),
];

// Past roles, in the same order as the group members above.
const pastRoles: Record<string, Record<string, string[]>> = {
  g1: {
    p1: ["r-prog", "r-lead", "r-design", "r-test", "r-docs", "r-present"],
    p2: ["r-test", "r-prog", "r-lead", "r-docs", "r-present", "r-design"],
  },
  g2: {
    p1: ["r-lead", "r-prog", "r-docs", "r-present", "r-design"],
    p2: ["r-prog", "r-design", "r-present", "r-test", "r-lead"],
  },
};

const pastAssignments: Assignment[] = groups.flatMap((group) => {
  const members = memberIds(group);
  return Object.entries(pastRoles[group.id]).flatMap(([projectId, roleIds]) =>
    roleIds.map((roleId, i): Assignment => ({
      projectId,
      groupId: group.id,
      studentId: members[i],
      roleId,
      source: projectId === "p1" ? "chosen" : "rotated",
    })),
  );
});

// Current project roles come from the real rotation function.
const currentAssignments: Assignment[] = groups.flatMap((group) => {
  const members = memberIds(group);
  const history = Object.fromEntries(
    members.map((id) => [
      id,
      pastAssignments.filter((a) => a.studentId === id).map((a) => a.roleId),
    ]),
  );
  const rotated = rotateRoles({
    studentIds: members,
    roleIds: group.roleIds,
    history,
    allowSharedRoles: group.allowSharedRoles,
  });
  return members.map((studentId): Assignment => ({
    projectId: currentProject.id,
    groupId: group.id,
    studentId,
    roleId: rotated[studentId],
    source: "rotated",
  }));
});

export const assignments: Assignment[] = [...pastAssignments, ...currentAssignments];

export const roleHistory: RoleHistory[] = classes[0].studentIds.map((studentId) => ({
  studentId,
  assignments: assignments.filter((a) => a.studentId === studentId),
}));

export const posts: Post[] = [
  { id: "post1", classId: CLASS_ID, type: "file", title: "Module 5 – Software Testing", body: "Read before Thursday's meeting.", postedAt: "2026-10-12T08:00:00", attachment: "module-5-testing.pdf" },
  { id: "post2", classId: CLASS_ID, type: "meeting", title: "Project 3 check-in", body: "Each table shows a 5-minute demo.", postedAt: "2026-10-14T09:00:00", dateTime: "2026-10-23T13:00:00", location: "Room 204" },
  { id: "post3", classId: CLASS_ID, type: "deadline", title: "Project 3 – test report", body: "Submit one report per table.", postedAt: "2026-10-15T10:00:00", dateTime: "2026-10-30T23:59:00" },
  { id: "post4", classId: CLASS_ID, type: "deadline", title: "Project 3 – final release", body: "Code, docs, and slides.", postedAt: "2026-10-15T10:05:00", dateTime: "2026-11-06T23:59:00" },
];

export const calendarEvents: CalendarEvent[] = [
  ...projects.map((p): CalendarEvent => ({
    id: `ev-${p.id}`,
    classId: CLASS_ID,
    type: "project-start",
    title: `${p.name} starts (roles rotate)`,
    start: `${p.startDate}T08:00:00`,
  })),
  ...posts
    .filter((p) => p.type !== "file" && p.dateTime)
    .map((p): CalendarEvent => ({
      id: `ev-${p.id}`,
      classId: CLASS_ID,
      type: p.type === "meeting" ? "meeting" : "deadline",
      title: p.title,
      start: p.dateTime!,
      location: p.location,
      postId: p.id,
    })),
];

// Lookup helpers

export function memberIds(group: Group): string[] {
  return group.seats.flatMap((s) => (s.studentId ? [s.studentId] : []));
}

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getRole(id: string): Role | undefined {
  return roles.find((r) => r.id === id);
}

export function getGroupFor(studentId: string): Group | undefined {
  return groups.find((g) => memberIds(g).includes(studentId));
}

export function getAssignment(studentId: string, projectId: string): Assignment | undefined {
  return assignments.find((a) => a.studentId === studentId && a.projectId === projectId);
}

/** The mock signed-in user for each "View as" mode. */
export const mockCurrentUser: Record<UserType, User> = {
  admin: getUser("admin1")!,
  student: getUser("s1")!,
};
