import type { UserType } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the mobile tab bar. */
  tab?: string;
  /** Nav glyph (hi-fi: ⌂ ◯ ▦ ≡ ↺ ▤). */
  icon: string;
}

// From the canvas: teacher nav = student nav + Settings.
export const NAV: Record<UserType, NavItem[]> = {
  student: [
    { href: "/student", label: "Dashboard", tab: "Home", icon: "⌂" },
    { href: "/groups", label: "Groups", tab: "Groups", icon: "◯" },
    { href: "/calendar", label: "Calendar", tab: "Calendar", icon: "▦" },
    { href: "/posts", label: "Posts", tab: "Posts", icon: "≡" },
    { href: "/history", label: "Role history", tab: "History", icon: "↺" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", tab: "Home", icon: "⌂" },
    { href: "/groups", label: "Groups", tab: "Groups", icon: "◯" },
    { href: "/calendar", label: "Calendar", tab: "Calendar", icon: "▦" },
    { href: "/posts", label: "Posts", tab: "Posts", icon: "≡" },
    { href: "/history", label: "Role history", tab: "History", icon: "↺" },
    { href: "/admin/groups", label: "Settings", icon: "▤" },
  ],
};

/** Screens shown without the app nav. */
export const NO_NAV = ["/", "/join"];

export const ROLE_LABEL: Record<UserType, string> = { admin: "Teacher (admin)", student: "Student" };
