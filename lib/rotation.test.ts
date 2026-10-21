import { describe, expect, it } from "vitest";
import { RotationError, rotateRoles } from "./rotation";

const ROLES = ["lead", "prog", "design", "test", "docs", "present"];
const STUDENTS = ["a", "b", "c", "d", "e", "f"];

const lastRole = (history: Record<string, string[]>, id: string) =>
  history[id]?.[history[id].length - 1];

describe("rotateRoles", () => {
  it("gives each of 6 students a different role, none repeating last project", () => {
    const history = Object.fromEntries(STUDENTS.map((s, i) => [s, [ROLES[i]]]));
    const result = rotateRoles({ studentIds: STUDENTS, roleIds: ROLES, history });

    expect(new Set(Object.values(result)).size).toBe(6);
    for (const s of STUDENTS) expect(result[s]).not.toBe(lastRole(history, s));
  });

  it("prefers roles a student has not done yet", () => {
    const history = { a: ["lead", "prog"], b: ["prog", "lead"] };
    const result = rotateRoles({
      studentIds: ["a", "b"],
      roleIds: ["lead", "prog", "docs"],
      history,
    });
    // Only one of them can get "docs"; the other must take the non-repeat old role.
    expect(Object.values(result)).toContain("docs");
    expect(result.a).not.toBe("prog");
    expect(result.b).not.toBe("lead");
  });

  it("fills every role before sharing when students > roles", () => {
    const students = [...STUDENTS, "g", "h"];
    const result = rotateRoles({ studentIds: students, roleIds: ROLES, history: {} });

    const counts = new Map<string, number>();
    for (const r of Object.values(result)) counts.set(r, (counts.get(r) ?? 0) + 1);
    expect(counts.size).toBe(6);
    expect(Math.max(...counts.values())).toBe(2);
  });

  it("refuses to share roles when sharing is off", () => {
    expect(() =>
      rotateRoles({
        studentIds: [...STUDENTS, "g"],
        roleIds: ROLES,
        history: {},
        allowSharedRoles: false,
      }),
    ).toThrow(RotationError);
  });

  it("throws when the only option is a repeat", () => {
    expect(() =>
      rotateRoles({ studentIds: ["a"], roleIds: ["lead"], history: { a: ["lead"] } }),
    ).toThrow(RotationError);
  });

  it("is deterministic", () => {
    const input = { studentIds: STUDENTS, roleIds: ROLES, history: {} };
    expect(rotateRoles(input)).toEqual(rotateRoles(input));
  });
});
