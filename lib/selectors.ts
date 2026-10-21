// Pure read helpers over the demo state. No React here, so they're easy to test.

import { classes, projects, TODAY, users } from "./mock-data";
import { rotateRoles, type RotationResult } from "./rotation";
import type {
  Assignment,
  CalendarEvent,
  Group,
  GroupStatus,
  Post,
  Project,
  Role,
  User,
} from "./types";

export interface DataState {
  roles: Role[];
  groups: Group[];
  assignments: Assignment[];
  posts: Post[];
}

export const theClass = classes[0];
export const currentProject: Project = projects.find((p) => p.status === "active")!;
export const previousProject = projects.find((p) => p.number === currentProject.number - 1);
export const nextProject = projects.find((p) => p.number === currentProject.number + 1);
export const projectsSoFar = projects.filter((p) => p.number <= currentProject.number);
export { TODAY };

export const getUser = (id: string): User | undefined => users.find((u) => u.id === id);
export const nameOf = (id: string) => getUser(id)?.name ?? "Unknown";
export const firstName = (id: string) => nameOf(id).split(" ")[0];

export const activeRoles = (s: DataState) => s.roles.filter((r) => !r.archived);
export const getRole = (s: DataState, id: string | undefined) =>
  id ? s.roles.find((r) => r.id === id) : undefined;

export const membersOf = (g: Group) =>
  g.seats.flatMap((seat) => (seat.studentId ? [seat.studentId] : []));
export const openSeats = (g: Group) => g.seats.length - membersOf(g).length;
export const groupOf = (s: DataState, studentId: string) =>
  s.groups.find((g) => membersOf(g).includes(studentId));
export const totalSeats = (s: DataState) => s.groups.reduce((n, g) => n + g.seats.length, 0);
export const seatedCount = (s: DataState) => s.groups.reduce((n, g) => n + membersOf(g).length, 0);

export function groupStatus(g: Group, projectStarted: boolean): GroupStatus {
  if (openSeats(g) === 0) return "full";
  return projectStarted ? "not-full-started" : "open";
}

export const assignmentFor = (s: DataState, studentId: string, projectId: string) =>
  s.assignments.find((a) => a.studentId === studentId && a.projectId === projectId);

export const roleFor = (s: DataState, studentId: string, projectId: string) =>
  getRole(s, assignmentFor(s, studentId, projectId)?.roleId);

/** A student's assignments, oldest project first. */
export function historyOf(s: DataState, studentId: string): Assignment[] {
  return projects.flatMap((p) => {
    const a = assignmentFor(s, studentId, p.id);
    return a ? [a] : [];
  });
}

export const doneRoleIds = (s: DataState, studentId: string) =>
  new Set(historyOf(s, studentId).map((a) => a.roleId));

export const neverDone = (s: DataState, studentId: string) => {
  const done = doneRoleIds(s, studentId);
  return activeRoles(s).filter((r) => !done.has(r.id));
};

/** Roles for the next project, from the real rotation rules. */
export function plannedRotation(s: DataState): RotationResult {
  const roleIds = activeRoles(s).map((r) => r.id);
  return Object.assign(
    {},
    ...s.groups.map((g) => {
      const members = membersOf(g);
      if (members.length === 0) return {};
      const history = Object.fromEntries(
        members.map((id) => [id, historyOf(s, id).map((a) => a.roleId)]),
      );
      try {
        return rotateRoles({ studentIds: members, roleIds, history, allowSharedRoles: g.allowSharedRoles });
      } catch {
        return {};
      }
    }),
  );
}

/** How many students have done each role so far. */
export function roleBalance(s: DataState) {
  return activeRoles(s).map((role) => ({
    role,
    count: theClass.studentIds.filter((id) => doneRoleIds(s, id).has(role.id)).length,
  }));
}

export const overrideCount = (s: DataState) =>
  s.assignments.filter((a) => a.projectId === currentProject.id && a.source === "override").length;

/** Times anyone had the same role two projects in a row. Should stay 0. */
export function repeatCount(s: DataState): number {
  return theClass.studentIds.reduce((n, id) => {
    const h = historyOf(s, id);
    return n + h.filter((a, i) => i > 0 && h[i - 1].roleId === a.roleId).length;
  }, 0);
}

export function calendarEvents(s: DataState): CalendarEvent[] {
  const starts = projects.map((p): CalendarEvent => ({
    id: `start-${p.id}`,
    classId: p.classId,
    type: "project-start",
    title: `Project ${p.number} starts · roles rotate`,
    start: `${p.startDate}T08:00`,
  }));
  const fromPosts = s.posts.flatMap((p): CalendarEvent[] =>
    p.dateTime && (p.type === "meeting" || p.type === "deadline")
      ? [{ id: `ev-${p.id}`, classId: p.classId, type: p.type, title: p.title, start: p.dateTime, location: p.location, attachment: p.attachment, postId: p.id }]
      : [],
  );
  return [...starts, ...fromPosts].sort((a, b) => a.start.localeCompare(b.start));
}

export const upcoming = (events: CalendarEvent[], type?: CalendarEvent["type"]) =>
  events.filter((e) => e.start.slice(0, 10) >= TODAY && (!type || e.type === type));
