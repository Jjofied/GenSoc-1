// Core data shapes for groupme.
// There is deliberately NO gender field on any type. Roles are never linked to who a person is.

/** "admin" is shown as "Teacher" in the UI. */
export type UserType = "admin" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  classIds: string[];
}

export interface Class {
  id: string;
  name: string;
  section: string;
  term: string;
  inviteCode: string;
  adminId: string;
  studentIds: string[];
}

/** A group role. Teachers can add, rename, or remove roles per class. */
export interface Role {
  id: string;
  classId: string;
  name: string;
  /** Neutral glyph, the same everywhere the role appears. */
  icon: string;
  focus: string;
  tasks: string[];
  /** Removed roles stay so past history still reads correctly. */
  archived?: boolean;
}

export type ProjectStatus = "upcoming" | "active" | "done";

export interface Project {
  id: string;
  classId: string;
  number: number;
  name: string;
  startDate: string; // ISO date
  dueDate: string; // ISO date (demo day)
  status: ProjectStatus;
}

/**
 * full             = every seat taken
 * open             = seats left, project not started (students can still join)
 * not-full-started = seats left after the project started (teacher needs to act)
 */
export type GroupStatus = "full" | "open" | "not-full-started";

export interface Seat {
  index: number;
  studentId: string | null;
}

export interface Group {
  id: string;
  classId: string;
  name: string;
  seats: Seat[];
  /** Two people may share a role when seats > roles. */
  allowSharedRoles: boolean;
}

export type AssignmentSource = "chosen" | "rotated" | "override";

/** One student's role in one project. */
export interface Assignment {
  projectId: string;
  groupId: string;
  studentId: string;
  roleId: string;
  source: AssignmentSource;
  /** Required when source is "override". */
  overrideReason?: string;
}

/** A student's roles across projects, oldest first. */
export interface RoleHistory {
  studentId: string;
  assignments: Assignment[];
}

export type PostType = "announcement" | "file" | "meeting" | "deadline";

export interface Attachment {
  name: string;
  size: string;
}

export interface Post {
  id: string;
  classId: string;
  type: PostType;
  title: string;
  body: string;
  postedAt: string; // ISO datetime
  attachment?: Attachment;
  /** Meeting/deadline date-time. These posts also show on the calendar. */
  dateTime?: string;
  /** Room or link for meetings. */
  location?: string;
}

export type CalendarEventType = "meeting" | "deadline" | "project-start";

export interface CalendarEvent {
  id: string;
  classId: string;
  type: CalendarEventType;
  title: string;
  start: string; // ISO datetime
  location?: string;
  attachment?: Attachment;
  postId?: string;
}
