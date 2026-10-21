// RotationStore backed by Supabase, using the secret-key client (server only).

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClassSnapshot, DueProject, NewAssignment, RotationStore } from "./rotation-job";

const check = <T>({ data, error }: { data: T | null; error: { message: string } | null }): T => {
  if (error) throw new Error(error.message);
  return data as T;
};

export function supabaseRotationStore(db: SupabaseClient): RotationStore {
  return {
    async dueProjects(today) {
      const rows = check<{ id: string; class_id: string; number: number; start_date: string }[]>(
        await db.from("projects").select("id, class_id, number, start_date").lte("start_date", today).is("rotated_at", null),
      );
      return rows.map((r): DueProject => ({ id: r.id, classId: r.class_id, number: r.number, startDate: r.start_date }));
    },

    async snapshot(project) {
      const [roles, groups, projects, assignments] = await Promise.all([
        db.from("roles").select("id").eq("class_id", project.classId).eq("archived", false).order("sort_order"),
        db.from("groups").select("id, allow_shared_roles, seats(seat_index, student_id)").eq("class_id", project.classId).order("sort_order"),
        db.from("projects").select("id, number").eq("class_id", project.classId),
        db.from("assignments").select("student_id, role_id, project_id").eq("class_id", project.classId),
      ]);
      const numberOf = new Map(check<{ id: string; number: number }[]>(projects).map((p) => [p.id, p.number]));
      const groupRows = check<{ id: string; allow_shared_roles: boolean; seats: { seat_index: number; student_id: string | null }[] }[]>(groups);

      return {
        roleIds: check<{ id: string }[]>(roles).map((r) => r.id),
        groups: groupRows.map((g) => ({
          id: g.id,
          allowSharedRoles: g.allow_shared_roles,
          memberIds: [...g.seats].sort((a, b) => a.seat_index - b.seat_index).flatMap((s) => (s.student_id ? [s.student_id] : [])),
        })),
        history: check<{ student_id: string; role_id: string; project_id: string }[]>(assignments).map((a) => ({
          studentId: a.student_id,
          roleId: a.role_id,
          projectNumber: numberOf.get(a.project_id) ?? 0,
        })),
      } satisfies ClassSnapshot;
    },

    async apply(projectId, rows: NewAssignment[]) {
      return check<boolean>(await db.rpc("apply_rotation", { p_project_id: projectId, p_rows: rows }));
    },
  };
}
