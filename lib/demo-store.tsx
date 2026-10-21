"use client";

// Shared demo state for the prototype. Seeded from mock data, kept in memory only:
// changes show across screens until the page is reloaded. No backend.

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import * as seed from "./mock-data";
import { currentProject, type DataState } from "./selectors";
import type { Group, Post, Role, UserType } from "./types";

export interface DemoState extends DataState {
  viewAs: UserType | null;
  toast: { id: number; text: string } | null;
}

export interface SetupInput {
  groupCount: number;
  seatsPerGroup: number;
  roles: Role[];
  allowSharedRoles: boolean;
}

type Action =
  | { type: "sign-in"; viewAs: UserType }
  | { type: "sign-out" }
  | { type: "move"; studentId: string; toGroupId: string | null; seatIndex?: number }
  | { type: "create-group"; id: string }
  | { type: "override"; studentId: string; roleId: string; reason: string }
  | { type: "add-post"; post: Post }
  | { type: "delete-post"; id: string }
  | { type: "save-setup"; setup: SetupInput }
  | { type: "toast"; text: string | null; id: number };

const clearSeat = (g: Group, studentId: string): Group => ({
  ...g,
  seats: g.seats.map((s) => (s.studentId === studentId ? { ...s, studentId: null } : s)),
});

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "sign-in":
      return { ...state, viewAs: action.viewAs };
    case "sign-out":
      return { ...state, viewAs: null };
    case "move": {
      const groups = state.groups.map((g) => clearSeat(g, action.studentId)).map((g) => {
        if (g.id !== action.toGroupId) return g;
        const target = action.seatIndex ?? g.seats.find((s) => !s.studentId)?.index;
        return {
          ...g,
          seats: g.seats.map((s) => (s.index === target && !s.studentId ? { ...s, studentId: action.studentId } : s)),
        };
      });
      // Keep the current-project assignment pointing at the new table.
      const assignments = state.assignments.map((a) =>
        a.studentId === action.studentId && a.projectId === currentProject.id && action.toGroupId
          ? { ...a, groupId: action.toGroupId }
          : a,
      );
      return { ...state, groups, assignments };
    }
    case "create-group": {
      const seats = state.groups[0]?.seats.length ?? 6;
      const group: Group = {
        id: action.id,
        classId: seed.classes[0].id,
        name: `Table ${state.groups.length + 1}`,
        allowSharedRoles: state.groups[0]?.allowSharedRoles ?? true,
        seats: Array.from({ length: seats }, (_, index) => ({ index, studentId: null })),
      };
      return { ...state, groups: [...state.groups, group] };
    }
    case "override":
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.studentId === action.studentId && a.projectId === currentProject.id
            ? { ...a, roleId: action.roleId, source: "override", overrideReason: action.reason }
            : a,
        ),
      };
    case "add-post":
      return { ...state, posts: [...state.posts, action.post] };
    case "delete-post":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.id) };
    case "save-setup": {
      const { groupCount, seatsPerGroup, roles, allowSharedRoles } = action.setup;
      const resized = state.groups.slice(0, groupCount).map((g): Group => {
        const members = g.seats.flatMap((s) => (s.studentId ? [s.studentId] : []));
        return {
          ...g,
          allowSharedRoles,
          seats: Array.from({ length: seatsPerGroup }, (_, index) => ({ index, studentId: members[index] ?? null })),
        };
      });
      const added = Array.from({ length: Math.max(0, groupCount - resized.length) }, (_, i): Group => ({
        id: `g-new-${resized.length + i + 1}`,
        classId: seed.classes[0].id,
        name: `Table ${resized.length + i + 1}`,
        allowSharedRoles,
        seats: Array.from({ length: seatsPerGroup }, (_, index) => ({ index, studentId: null })),
      }));
      return { ...state, roles, groups: [...resized, ...added] };
    }
    case "toast":
      return { ...state, toast: action.text ? { id: action.id, text: action.text } : null };
  }
}

function writeSessionCookie(name: string, viewAs: UserType | null, sharedDevice = false) {
  document.cookie = viewAs
    ? `${name}=${viewAs}; path=/; SameSite=Lax${sharedDevice ? "" : "; max-age=2592000"}`
    : `${name}=; path=/; max-age=0`;
}

function useDemoValue(initialViewAs: UserType | null, sessionCookie: string) {
  const [state, dispatch] = useReducer(reducer, undefined, (): DemoState => ({
    viewAs: initialViewAs,
    roles: seed.roles,
    groups: seed.groups,
    assignments: seed.assignments,
    posts: seed.posts,
    toast: null,
  }));

  const actions = useMemo(
    () => ({
      /** sharedDevice = session cookie that ends when the browser closes. */
      signIn(viewAs: UserType, sharedDevice = false) {
        writeSessionCookie(sessionCookie, viewAs, sharedDevice);
        dispatch({ type: "sign-in", viewAs });
      },
      signOut() {
        writeSessionCookie(sessionCookie, null);
        dispatch({ type: "sign-out" });
      },
      move: (studentId: string, toGroupId: string | null, seatIndex?: number) =>
        dispatch({ type: "move", studentId, toGroupId, seatIndex }),
      createGroup: () => dispatch({ type: "create-group", id: `g-${Date.now()}` }),
      override: (studentId: string, roleId: string, reason: string) =>
        dispatch({ type: "override", studentId, roleId, reason }),
      addPost: (post: Post) => dispatch({ type: "add-post", post }),
      deletePost: (id: string) => dispatch({ type: "delete-post", id }),
      saveSetup: (setup: SetupInput) => dispatch({ type: "save-setup", setup }),
      toast: (text: string | null) => dispatch({ type: "toast", text, id: Date.now() }),
    }),
    [sessionCookie],
  );

  return useMemo(() => ({ state, ...actions }), [state, actions]);
}

type DemoValue = ReturnType<typeof useDemoValue>;
const DemoContext = createContext<DemoValue | null>(null);

export function DemoProvider({
  initialViewAs,
  sessionCookie,
  children,
}: {
  initialViewAs: UserType | null;
  sessionCookie: string;
  children: ReactNode;
}) {
  return <DemoContext value={useDemoValue(initialViewAs, sessionCookie)}>{children}</DemoContext>;
}

export function useDemo(): DemoValue {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside <DemoProvider>");
  return value;
}
