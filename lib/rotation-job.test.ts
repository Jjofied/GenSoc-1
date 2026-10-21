import { describe, expect, it } from "vitest";
import { runRotationJob, type ClassSnapshot, type DueProject, type NewAssignment, type RotationStore } from "./rotation-job";
import { todayIn } from "./school-time";

const ROLES = ["lead", "prog", "design", "test", "docs", "present"];
const MEMBERS = ["a", "b", "c", "d", "e", "f"];

/** In-memory stand-in for the database, with the same "claim once" rule as apply_rotation(). */
function fakeStore(projects: (DueProject & { rotatedAt?: string })[], history: ClassSnapshot["history"]) {
  const saved: (NewAssignment & { projectId: string })[] = [];
  const store: RotationStore = {
    async dueProjects(today) {
      return projects.filter((p) => p.startDate <= today && !p.rotatedAt);
    },
    async snapshot() {
      return {
        roleIds: ROLES,
        groups: [{ id: "g1", allowSharedRoles: true, memberIds: MEMBERS }],
        history: [...history, ...saved.map((s) => ({ studentId: s.student_id, roleId: s.role_id, projectNumber: projects.find((p) => p.id === s.projectId)!.number }))],
      };
    },
    async apply(projectId, rows) {
      const p = projects.find((x) => x.id === projectId)!;
      if (p.rotatedAt) return false;
      p.rotatedAt = "now";
      saved.push(...rows.map((r) => ({ ...r, projectId })));
      return true;
    },
  };
  return { store, saved };
}

const p1History = MEMBERS.map((studentId, i) => ({ studentId, roleId: ROLES[i], projectNumber: 1 }));

describe("runRotationJob", () => {
  it("rotates a due project once, even when run twice", async () => {
    const { store, saved } = fakeStore([{ id: "p2", classId: "c", number: 2, startDate: "2026-10-05" }], p1History);

    const first = await runRotationJob(store, "2026-10-05");
    const second = await runRotationJob(store, "2026-10-05");

    expect(first.results).toEqual([{ projectId: "p2", status: "rotated", assigned: 6 }]);
    expect(second.results).toEqual([]);
    expect(saved).toHaveLength(6);
  });

  it("does nothing a second time if two runs race for the same project", async () => {
    const { store, saved } = fakeStore([{ id: "p2", classId: "c", number: 2, startDate: "2026-10-05" }], p1History);
    // Both runs see the project as due before either saves.
    const stale = { ...store, dueProjects: async () => [{ id: "p2", classId: "c", number: 2, startDate: "2026-10-05" }] };

    const [a, b] = await Promise.all([runRotationJob(stale, "2026-10-05"), runRotationJob(stale, "2026-10-05")]);

    expect([a.results[0].status, b.results[0].status].sort()).toEqual(["already-rotated", "rotated"]);
    expect(saved).toHaveLength(6);
  });

  it("never gives anyone their previous project's role", async () => {
    const { store, saved } = fakeStore([{ id: "p2", classId: "c", number: 2, startDate: "2026-10-05" }], p1History);
    await runRotationJob(store, "2026-10-05");

    for (const row of saved) {
      const last = p1History.find((h) => h.studentId === row.student_id)!.roleId;
      expect(row.role_id).not.toBe(last);
    }
  });

  it("leaves projects that haven't started alone", async () => {
    const { store, saved } = fakeStore([{ id: "p3", classId: "c", number: 3, startDate: "2026-11-16" }], p1History);
    const report = await runRotationJob(store, "2026-11-15");
    expect(report.results).toEqual([]);
    expect(saved).toHaveLength(0);
  });

  it("only marks Project 1 as started, since students pick those roles", async () => {
    const { store, saved } = fakeStore([{ id: "p1", classId: "c", number: 1, startDate: "2026-08-17" }], []);
    const report = await runRotationJob(store, "2026-08-17");
    expect(report.results).toEqual([{ projectId: "p1", status: "started", assigned: 0 }]);
    expect(saved).toHaveLength(0);
  });

  it("saves nothing and reports an error when a table can't be rotated", async () => {
    const { store, saved } = fakeStore([{ id: "p2", classId: "c", number: 2, startDate: "2026-10-05" }], p1History);
    const oneRole = { ...store, snapshot: async () => ({ roleIds: ["lead"], groups: [{ id: "g1", allowSharedRoles: true, memberIds: ["a"] }], history: [{ studentId: "a", roleId: "lead", projectNumber: 1 }] }) };

    const report = await runRotationJob(oneRole, "2026-10-05");
    expect(report.results[0].status).toBe("error");
    expect(saved).toHaveLength(0);
  });
});

describe("todayIn", () => {
  it("uses the school's date, not UTC's", () => {
    const lateUtc = new Date("2026-11-15T16:30:00Z"); // 00:30 on Nov 16 in Manila
    expect(todayIn("UTC", lateUtc)).toBe("2026-11-15");
    expect(todayIn("Asia/Manila", lateUtc)).toBe("2026-11-16");
  });
});
