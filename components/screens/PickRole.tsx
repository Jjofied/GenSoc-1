"use client";

import { useState } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleChip, RoleIcon } from "@/components/RoleChip";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { ProgressBar } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { StateCard } from "@/components/ui/StateCard";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { ME_ID, projects, TEACHER_ID } from "@/lib/mock-data";
import {
  activeRoles, assignmentFor, currentProject, doneRoleIds, groupOf, nameOf, previousProject, roleFor,
} from "@/lib/selectors";

const P1 = projects[0];

// Project 1 picture from the canvas: Table 3 with 7 seats and sharing on.
// Morgan D. picks Debugger & Tester at the same moment, to show the "just taken" error.
const P1_TAKEN: Record<string, { by: string[]; seats: number }> = {
  "r-lead": { by: ["s-samt"], seats: 1 },
  "r-design": { by: ["s-caseym"], seats: 1 },
  "r-present": { by: ["s-rileyp"], seats: 1 },
  "r-docs": { by: ["s-jordanl"], seats: 2 },
};
const RACE = { roleId: "r-test", by: "s-morgand" };

/** WF08 · Pick role (Project 1) or see your rotated role (Project 2+). */
export function PickRole({ preview }: { preview: string }) {
  const isP1 = preview === "project1";

  return (
    <RoleGate allow="student" title="Students pick their own role" message="You can see and override everyone’s roles in Role history." action={{ href: "/history", label: "Open role history" }}>
      <PreviewBar
        current={{ state: preview }}
        groups={[{ param: "state", label: "Variant", options: [["", `Project ${currentProject.number} · Rotated`], ["project1", "Project 1 · You choose"]] }]}
      />
      {isP1 ? <ChooseRole /> : <RotatedRole />}
    </RoleGate>
  );
}

function ChooseRole() {
  const { state } = useDemo();
  const [selected, setSelected] = useState("r-prog");
  const [raced, setRaced] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const roles = activeRoles(state);
  const chosen = roles.find((r) => r.id === selected);

  const takenBy = (roleId: string) => [
    ...(P1_TAKEN[roleId]?.by ?? []),
    ...(raced && roleId === RACE.roleId ? [RACE.by] : []),
  ];
  const isFull = (roleId: string) => takenBy(roleId).length >= (P1_TAKEN[roleId]?.seats ?? 1);

  if (confirmed && chosen)
    return (
      <>
        <ScreenHeader id="WF08" title="Pick your role" sub={`Project 1 · ${P1.name}`} />
        <StateCard kind="success" title={`You’re the ${chosen.name}`} action={<LinkButton href="/student" kind="primary">Back to dashboard</LinkButton>}>
          Next project you’ll rotate to a new role.
        </StateCard>
      </>
    );

  const confirm = () => {
    if (selected === RACE.roleId && !raced) return setRaced(true);
    setConfirmed(true);
  };

  return (
    <>
      <ScreenHeader id="WF08" title="Pick your role" sub={`Project 1 · ${P1.name} · Table 3 (7 seats, sharing on)`} />
      <BlockGrid>
        <Block span={12} bare>
          {raced && isFull(selected) ? (
            <Banner kind="alert">
              <b>Debugger & Tester was just taken.</b> {nameOf(RACE.by)} picked it first. Choose another open role.
            </Banner>
          ) : (
            <Banner>From Project 2, roles rotate automatically. You won’t get the same role twice in a row.</Banner>
          )}
        </Block>
        <Block span={12} strong label="Roles">
          <fieldset>
            <legend className="sr-only">Choose your role</legend>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((r) => {
                const by = takenBy(r.id);
                const seats = P1_TAKEN[r.id]?.seats ?? 1;
                const full = isFull(r.id);
                const on = selected === r.id && !full;
                const status = full
                  ? `Taken · ${by.map(nameOf).join(", ")}`
                  : seats > 1
                    ? `Shared · ${seats} seats · ${by.length} taken`
                    : "Open";
                return (
                  <li key={r.id}>
                    <label
                      className={cn(
                        "flex h-full cursor-pointer flex-col gap-2 rounded-lg bg-white p-3.5",
                        on ? "border-[2.5px] border-ink" : "border-[1.5px] border-line",
                        full && "cursor-not-allowed bg-fill-soft text-muted",
                      )}
                    >
                      <input type="radio" name="role" className="sr-only" value={r.id} checked={on} disabled={full} onChange={() => setSelected(r.id)} />
                      <span className="flex items-center justify-between gap-2">
                        <RoleIcon role={r} size="lg" dashed={full} />
                        {on && <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">SELECTED</span>}
                      </span>
                      <span className="font-bold text-ink">{r.name}</span>
                      <span className="text-xs">{r.focus}</span>
                      <span className="mt-auto font-mono text-[11px] font-semibold">{status}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </Block>
        <Block span={12} bare>
          <div className="flex flex-wrap items-center gap-3">
            <Button kind="primary" onClick={confirm} disabled={!chosen || isFull(selected)}>
              Confirm{chosen && !isFull(selected) ? `: ${chosen.name}` : ""}
            </Button>
            <span className="text-xs text-muted">You can change it until Project 1 starts.</span>
          </div>
        </Block>
      </BlockGrid>
    </>
  );
}

function RotatedRole() {
  const { state } = useDemo();
  const a = assignmentFor(state, ME_ID, currentProject.id);
  const role = roleFor(state, ME_ID, currentProject.id);
  const last = previousProject && roleFor(state, ME_ID, previousProject.id);
  const done = doneRoleIds(state, ME_ID);
  const roles = activeRoles(state);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  return (
    <>
      <ScreenHeader id="WF08" title="My role" sub={`Project ${currentProject.number} · ${currentProject.name}${groupOf(state, ME_ID) ? ` · ${groupOf(state, ME_ID)!.name}` : ""}`} />
      {!role ? (
        <StateCard kind="empty" title="No role yet" action={<LinkButton href="/groups" kind="primary">Find a table</LinkButton>}>
          Sit at a table first. Your role is set when the project starts.
        </StateCard>
      ) : (
        <BlockGrid>
          <Block span={8} strong label={a?.source === "override" ? "Your role · set by your teacher" : "Your role · set by rotation"}>
            <RoleChip role={role} size="lg" />
            <p className="font-semibold">
              Your role this project: {role.name}
              {last && ` (last project: ${last.name})`}
            </p>
            {a?.source === "override" && a.overrideReason && (
              <p className="text-sm text-ink-2">
                <b>Why it changed:</b> {a.overrideReason}
              </p>
            )}
            {role.tasks.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {role.tasks.map((t, i) => (
                  <li key={t}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-ink"
                        checked={checked.has(i)}
                        onChange={() =>
                          setChecked((s) => {
                            const n = new Set(s);
                            if (n.has(i)) n.delete(i);
                            else n.add(i);
                            return n;
                          })
                        }
                      />
                      {t}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted">Questions? Only {nameOf(TEACHER_ID)} can change roles.</p>
          </Block>
          <Block span={4} label="Roles you’ve done" go={{ href: "/history", label: "Role history" }}>
            <ul className="flex flex-col gap-1.5">
              {roles.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <RoleChip role={r} dashed={!done.has(r.id)} />
                  <span className="text-xs text-muted">{r.id === role.id ? "now" : done.has(r.id) ? "done" : "still to try"}</span>
                </li>
              ))}
            </ul>
            <ProgressBar label="Roles done" value={done.size / roles.length} note={`${done.size}/${roles.length}`} />
          </Block>
        </BlockGrid>
      )}
    </>
  );
}
