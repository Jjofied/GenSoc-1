// The daily rotation job, kept free of Supabase so it can be tested.
// For every project whose start date has arrived and that hasn't been rotated yet:
//   - Project 1: students chose their roles, so it just gets marked as started.
//   - Project 2+: lib/rotation.ts picks new roles per table; all of them are saved in one go.
// Saving goes through store.apply(), which only succeeds once per project, so running the job
// twice (or two runs at once) never rotates twice.

import { rotateRoles } from "./rotation";

export interface DueProject {
  id: string;
  classId: string;
  number: number;
  startDate: string; // YYYY-MM-DD
}

export interface ClassSnapshot {
  /** Active roles, in display order. */
  roleIds: string[];
  groups: { id: string; allowSharedRoles: boolean; memberIds: string[] }[];
  /** Every assignment in the class, with its project number. */
  history: { studentId: string; roleId: string; projectNumber: number }[];
}

export interface NewAssignment {
  group_id: string;
  student_id: string;
  role_id: string;
}

export interface RotationStore {
  /** Projects with start_date <= today and rotated_at still empty. */
  dueProjects(today: string): Promise<DueProject[]>;
  snapshot(project: DueProject): Promise<ClassSnapshot>;
  /** Saves all rows and marks the project rotated, atomically. False if it was already rotated. */
  apply(projectId: string, rows: NewAssignment[]): Promise<boolean>;
}

export type ProjectResult =
  | { projectId: string; status: "rotated"; assigned: number }
  | { projectId: string; status: "started"; assigned: 0 }
  | { projectId: string; status: "already-rotated" }
  | { projectId: string; status: "error"; message: string };

/** Works out every student's role for the project. Throws RotationError if a table can't be rotated. */
export function planRotation(project: DueProject, snap: ClassSnapshot): NewAssignment[] {
  if (project.number === 1) return [];
  const past = snap.history
    .filter((h) => h.projectNumber < project.number)
    .sort((a, b) => a.projectNumber - b.projectNumber);

  return snap.groups.flatMap((group) => {
    if (group.memberIds.length === 0) return [];
    const history = Object.fromEntries(
      group.memberIds.map((id) => [id, past.filter((h) => h.studentId === id).map((h) => h.roleId)]),
    );
    const roles = rotateRoles({
      studentIds: group.memberIds,
      roleIds: snap.roleIds,
      history,
      allowSharedRoles: group.allowSharedRoles,
    });
    return group.memberIds.map((id) => ({ group_id: group.id, student_id: id, role_id: roles[id] }));
  });
}

export async function runRotationJob(store: RotationStore, today: string): Promise<{ today: string; results: ProjectResult[] }> {
  const projects = (await store.dueProjects(today)).sort((a, b) => a.number - b.number);
  const results: ProjectResult[] = [];

  for (const project of projects) {
    try {
      const rows = planRotation(project, await store.snapshot(project));
      const applied = await store.apply(project.id, rows);
      results.push(
        !applied
          ? { projectId: project.id, status: "already-rotated" }
          : project.number === 1
            ? { projectId: project.id, status: "started", assigned: 0 }
            : { projectId: project.id, status: "rotated", assigned: rows.length },
      );
    } catch (err) {
      // Nothing is saved for this project; it's retried on the next run.
      const message = err instanceof Error ? err.message : String(err);
      results.push({ projectId: project.id, status: "error", message });
    }
  }
  return { today, results };
}
