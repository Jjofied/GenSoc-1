"use client";

// Mock auth for the scaffold: a "View as" switch instead of real sign-in.
// Stored in localStorage so the choice survives reloads. Replace with real auth later.

import { useSyncExternalStore } from "react";
import type { UserType } from "./types";

const KEY = "groupme:view-as";
const DEFAULT: UserType = "student";
const listeners = new Set<() => void>();
let current: UserType | null = null;

function read(): UserType {
  try {
    return localStorage.getItem(KEY) === "admin" ? "admin" : "student";
  } catch {
    return DEFAULT;
  }
}

export function setViewAs(type: UserType) {
  try {
    localStorage.setItem(KEY, type);
  } catch {
    // Storage blocked: the switch still works until reload.
  }
  current = type;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useViewAs(): UserType {
  return useSyncExternalStore(
    subscribe,
    () => (current ??= read()),
    () => DEFAULT,
  );
}

/** Show the switcher in dev, or when NEXT_PUBLIC_SHOW_VIEW_AS=true (e.g. for a class demo build). */
export const showViewAsSwitcher =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_VIEW_AS === "true";
