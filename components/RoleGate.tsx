"use client";

import type { ReactNode } from "react";
import { useDemo } from "@/lib/demo-store";
import type { UserType } from "@/lib/types";
import { LinkButton } from "./ui/Button";
import { StateCard } from "./ui/StateCard";

/** Shows children only to one user type; everyone else gets the permission-denied state. */
export function RoleGate({
  allow,
  title,
  message,
  action,
  children,
}: {
  allow: UserType;
  title: string;
  message: string;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  const { state } = useDemo();
  if (state.viewAs === allow) return <>{children}</>;
  if (!state.viewAs)
    return (
      <StateCard kind="info" title="You’re signed out" action={<LinkButton href="/" kind="primary">Sign in</LinkButton>}>
        Sign in to see this page.
      </StateCard>
    );
  return (
    <StateCard
      kind="denied"
      title={title}
      action={action && <LinkButton href={action.href} kind="primary">{action.label}</LinkButton>}
    >
      {message}
    </StateCard>
  );
}
