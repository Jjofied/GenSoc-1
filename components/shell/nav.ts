import type { UserType } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the mobile tab bar. */
  tab?: string;
}

// From the canvas: teacher nav = student nav + Settings.
export const NAV: Record<UserType, NavItem[]> = {
  student: [
    { href: "/student", label: "Dashboard", tab: "Home" },
    { href: "/groups", label: "Groups", tab: "Groups" },
    { href: "/calendar", label: "Calendar", tab: "Calendar" },
    { href: "/posts", label: "Posts", tab: "Posts" },
    { href: "/history", label: "Role history", tab: "History" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", tab: "Home" },
    { href: "/groups", label: "Groups", tab: "Groups" },
    { href: "/calendar", label: "Calendar", tab: "Calendar" },
    { href: "/posts", label: "Posts", tab: "Posts" },
    { href: "/history", label: "Role history", tab: "History" },
    { href: "/admin/groups", label: "Settings" },
  ],
};

/** Screens shown without the app nav. */
export const NO_NAV = ["/", "/join"];

export const ROLE_LABEL: Record<UserType, string> = { admin: "Teacher", student: "Student" };
