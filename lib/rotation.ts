// Role rotation for a new project. Pure function, no side effects.
//
// Rules, strongest first:
// 1. Hard: no one gets the role they had in their previous project.
// 2. When there are at least as many students as roles, every role is filled
//    before any role is shared.
// 3. Prefer roles a student has done fewer times (never-done roles first).
// Ties are broken by input order, so the result is deterministic.

export interface RotationInput {
  studentIds: string[];
  /** Roles the group uses, in display order. */
  roleIds: string[];
  /** Past roles per student, oldest first. Missing = no history. */
  history: Record<string, string[]>;
  /** Allow two or more people per role when students > roles. */
  allowSharedRoles?: boolean;
}

/** studentId -> roleId */
export type RotationResult = Record<string, string>;

export class RotationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RotationError";
  }
}

const SHARED_SEAT_COST = 1000;
const REPEAT_DONE_COST = 10;
const MAX_SLOTS = 20;

interface Slot {
  roleId: string;
  /** 0 for the first person in a role, 1+ for people sharing it. */
  copy: number;
}

export function rotateRoles(input: RotationInput): RotationResult {
  const { studentIds, roleIds, history } = input;
  const allowShared = input.allowSharedRoles ?? true;

  if (studentIds.length === 0) return {};
  if (roleIds.length === 0) throw new RotationError("The group has no roles.");
  if (studentIds.length > roleIds.length && !allowShared) {
    throw new RotationError(
      "More students than roles. Turn on shared roles or add a role.",
    );
  }

  const perRole = Math.ceil(studentIds.length / roleIds.length);
  const slots: Slot[] = [];
  for (let copy = 0; copy < perRole; copy++) {
    for (const roleId of roleIds) slots.push({ roleId, copy });
  }
  if (slots.length > MAX_SLOTS) {
    throw new RotationError("Group is too large to rotate automatically.");
  }

  const cost = (studentId: string, slot: Slot): number => {
    const past = history[studentId] ?? [];
    if (past[past.length - 1] === slot.roleId) return Infinity;
    const timesDone = past.filter((r) => r === slot.roleId).length;
    return slot.copy * SHARED_SEAT_COST + timesDone * REPEAT_DONE_COST;
  };

  // Exact min-cost assignment: DP over students with a bitmask of used slots.
  const memo = new Map<string, { total: number; pick: number }>();
  const solve = (i: number, used: number): number => {
    if (i === studentIds.length) return 0;
    const key = `${i}:${used}`;
    const cached = memo.get(key);
    if (cached) return cached.total;

    let best = { total: Infinity, pick: -1 };
    for (let s = 0; s < slots.length; s++) {
      if (used & (1 << s)) continue;
      const c = cost(studentIds[i], slots[s]);
      if (c === Infinity) continue;
      const total = c + solve(i + 1, used | (1 << s));
      if (total < best.total) best = { total, pick: s };
    }
    memo.set(key, best);
    return best.total;
  };

  if (solve(0, 0) === Infinity) {
    throw new RotationError(
      "No rotation avoids a repeat role. Add a role or set roles by hand.",
    );
  }

  const result: RotationResult = {};
  let used = 0;
  studentIds.forEach((studentId, i) => {
    const { pick } = memo.get(`${i}:${used}`)!;
    result[studentId] = slots[pick].roleId;
    used |= 1 << pick;
  });
  return result;
}
