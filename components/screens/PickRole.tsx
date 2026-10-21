"use client";

import { useState } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleChip, RoleIcon } from "@/components/RoleChip";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { GoLink, LinkButton } from "@/components/ui/Button";
import { StateCard } from "@/components/ui/StateCard";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { ME_ID, projects, TEACHER_ID } from "@/lib/mock-data";
import {
  activeRoles, assignmentFor, currentProject, groupOf, historyOf, nameOf, previousProject, roleFor,
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

/** HF08 · Pick role (Project 1) or see your rotated role (Project 2+). */
export function PickRole({ preview }: { preview: string }) {
  const isP1 = preview === "project1" || preview === "taken" || preview === "confirmed";

  return (
    <RoleGate allow="student" title="Students pick their own role" message="You can see and override everyone’s roles in Role history." action={{ href: "/history", label: "Open role history" }}>
      <PreviewBar
        current={{ state: preview }}
        groups={[
          {
            param: "state",
            label: "Variant",
            options: [
              ["", `Project ${currentProject.number} · Rotated`],
              ["project1", "Project 1 · You choose"],
              ["taken", "Project 1 · Just taken"],
              ["confirmed", "Project 1 · Confirmed"],
            ],
          },
        ]}
      />
      {/* Keyed so switching previews resets the pick. */}
      {isP1 ? <ChooseRole key={preview} preview={preview} /> : <RotatedRole />}
    </RoleGate>
  );
}

function ChooseRole({ preview }: { preview: string }) {
  const { state } = useDemo();
  const [selected, setSelected] = useState<string | null>(() =>
    preview === "taken" ? RACE.roleId : preview === "confirmed" ? "r-prog" : null,
  );
  const [raced, setRaced] = useState(preview === "taken");
  const [confirmed, setConfirmed] = useState(preview === "confirmed");
  const roles = activeRoles(state);

  const takenBy = (roleId: string) => [
    ...(P1_TAKEN[roleId]?.by ?? []),
    ...(raced && roleId === RACE.roleId ? [RACE.by] : []),
  ];
  const isFull = (roleId: string) => takenBy(roleId).length >= (P1_TAKEN[roleId]?.seats ?? 1);
  // A pick that someone else just took no longer counts.
  const chosen = roles.find((r) => r.id === selected && !isFull(r.id));

  if (confirmed && chosen)
    return (
      <div
        role="status"
        className="flex max-w-[600px] flex-col items-start gap-4 rounded-2xl border-[1.5px] border-ink bg-white px-6 py-7 shadow-hard-md"
      >
        <span aria-hidden className="grid h-[52px] w-[52px] place-items-center rounded-full bg-ok-bg text-[26px] font-bold text-ok">✓</span>
        <h1 className="font-serif text-4xl font-normal leading-[1.02] tracking-[-0.015em]">
          You’re the {chosen.name} for Project 1
        </h1>
        <RoleChip role={chosen} size="lg" />
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-ink-2">
          <li>Your table can see your role now.</li>
          <li>Next project, roles rotate. You won’t be {chosen.name} two projects in a row.</li>
          <li>Need to change? Ask {nameOf(TEACHER_ID)} before Project 1 starts.</li>
        </ul>
        <div className="flex flex-wrap gap-2.5">
          <LinkButton href="/student" kind="primary">Back to dashboard</LinkButton>
          <LinkButton href="/groups">See my table</LinkButton>
        </div>
      </div>
    );

  const confirm = () => {
    if (!chosen) return;
    if (chosen.id === RACE.roleId && !raced) return setRaced(true);
    setConfirmed(true);
  };

  return (
    <>
      <ScreenHeader
        id="WF08"
        title="Pick your role"
        kicker={`Project 1 · ${P1.name} · Table 3 (7 seats, sharing on)`}
        sub="Project 1 only: pick the role you want. Everyone can see who has taken each role."
      />
      <div className="flex flex-col gap-4">
        <div role="note" className="flex items-start gap-2.5 rounded-xl border-[1.5px] border-ink bg-mint-2 px-4 py-3">
          <span aria-hidden className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full border-[1.5px] border-muted text-xs font-bold">i</span>
          <span>
            <b>From Project 2, roles rotate automatically.</b> You won’t get the same role twice in a row.
          </span>
        </div>
        {raced && selected === RACE.roleId && (
          <Banner kind="alert">
            <b>{roles.find((r) => r.id === RACE.roleId)?.name} was just picked by {nameOf(RACE.by)}.</b> Choose another open role.
          </Banner>
        )}

        <fieldset>
          <legend className="sr-only">Roles</legend>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-3">
            {roles.map((r) => {
              const by = takenBy(r.id);
              const seats = P1_TAKEN[r.id]?.seats ?? 1;
              const full = isFull(r.id);
              const on = chosen?.id === r.id;
              const status = full
                ? `Taken by ${by.map(nameOf).join(" + ")}`
                : seats > 1
                  ? `Shared · ${seats} seats${by.length ? ` · ${by.map(nameOf).join(" + ")} + ${seats - by.length} open` : ""}`
                  : "Open";
              return (
                <li key={r.id}>
                  <label
                    className={cn(
                      "flex h-full min-h-[150px] flex-col items-start gap-2.5 rounded-[14px] p-4 has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink",
                      on ? "border-[3px] border-ink bg-white" : full ? "border-[1.5px] border-dashed border-[#c9c9c2] bg-mint-hover opacity-70" : "border-[1.5px] border-mint-line bg-white",
                      full ? "cursor-not-allowed" : "cursor-pointer",
                    )}
                  >
                    <input type="radio" name="role" className="sr-only" value={r.id} checked={on} disabled={full} onChange={() => setSelected(r.id)} />
                    <span className="flex w-full items-center justify-between gap-2">
                      <RoleChip role={r} />
                      <span
                        aria-hidden
                        className={cn("grid h-[22px] w-[22px] flex-none place-items-center rounded-full border-2 bg-white", on ? "border-ink" : "border-muted-line")}
                      >
                        <span className={cn("h-2.5 w-2.5 rounded-full", on && "bg-ink")} />
                      </span>
                    </span>
                    <span className="text-[15px] text-ink-2">{r.focus}.</span>
                    <span className={cn("mt-auto text-sm font-bold", full ? "text-muted" : "text-ok")}>{status}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t-[1.5px] border-ink bg-mint py-3.5">
          <span className="flex-[1_1_220px] text-muted">
            {chosen ? "You can change your pick until Project 1 starts." : "Select an open role to continue."}
          </span>
          <button
            type="button"
            onClick={confirm}
            disabled={!chosen}
            className={cn(
              "h-[52px] rounded-xl px-6 text-[17px] font-bold text-white",
              chosen ? "cursor-pointer bg-ink hover:bg-ink-2" : "cursor-not-allowed bg-muted-line",
            )}
          >
            {chosen ? `Confirm: ${chosen.name}` : "Confirm role"}
          </button>
        </div>
      </div>
    </>
  );
}

function RotatedRole() {
  const { state } = useDemo();
  const a = assignmentFor(state, ME_ID, currentProject.id);
  const role = roleFor(state, ME_ID, currentProject.id);
  const last = previousProject && roleFor(state, ME_ID, previousProject.id);
  const roles = activeRoles(state);
  const group = groupOf(state, ME_ID);
  // roleId → project number it was done in (latest wins).
  const doneIn = new Map(historyOf(state, ME_ID).map((h) => [h.roleId, projects.find((p) => p.id === h.projectId)?.number]));
  const [checked, setChecked] = useState<Set<number>>(new Set());

  return (
    <>
      <ScreenHeader
        id="WF08"
        title="My role"
        kicker={`Project ${currentProject.number} · ${currentProject.name}${group ? ` · ${group.name}` : ""}`}
      />
      {!role ? (
        <StateCard kind="empty" title="No role yet" action={<LinkButton href="/groups" kind="primary">Find a table</LinkButton>}>
          Sit at a table first. Your role is set when the project starts.
        </StateCard>
      ) : (
        <div className="flex flex-wrap items-start gap-4">
          <section className="flex min-w-0 flex-[1.4_1_360px] flex-col gap-4 rounded-2xl border-[1.5px] border-ink bg-white p-6 shadow-hard-lg">
            <span className="self-start rounded-md bg-mint-2 px-2.5 py-0.5 text-sm font-bold">
              {a?.source === "override" ? "✎ Set by your teacher" : "↻ Set by rotation"}
            </span>
            <span className="text-[17px] font-bold">Your role this project:</span>
            <span>
              <RoleChip role={role} size="lg" />
            </span>
            {last && (
              <span className="flex flex-wrap items-center gap-2 text-muted">
                (last project: <RoleChip role={last} size="sm" />)
              </span>
            )}
            {a?.source === "override" && a.overrideReason && (
              <p className="text-sm text-ink-2">
                <b>Why it changed:</b> {a.overrideReason}
              </p>
            )}
            {role.tasks.length > 0 && (
              <fieldset>
                <legend className="font-bold">What you’ll do</legend>
                <ul className="mt-1.5 flex flex-col">
                  {role.tasks.map((t, i) => (
                    <li key={t}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
                        <input
                          type="checkbox"
                          className="h-[18px] w-[18px] accent-primary"
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
                        <span className={cn(checked.has(i) && "text-muted line-through")}>{t}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
            <p className="rounded-xl bg-mint px-3.5 py-3 text-[15px] text-ink-2">
              No one gets the same role two projects in a row. Think something’s wrong? Message {nameOf(TEACHER_ID)} — only teachers can change roles.
            </p>
          </section>

          <section className="flex min-w-0 flex-[1_1_280px] flex-col gap-3 rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-md">
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold">Roles you’ve done</h2>
              <span className="text-muted">
                {doneIn.size} of {roles.length}
              </span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {roles.map((r) => {
                const n = doneIn.get(r.id);
                const now = r.id === role.id;
                return (
                  <li key={r.id} className="flex items-center gap-2.5">
                    <RoleIcon role={r} dashed={n == null} />
                    <span className={cn("flex-1", n == null ? "text-muted" : "text-ink")}>{r.name}</span>
                    <span className="text-sm text-muted">{now ? "Now" : n != null ? `Project ${n}` : "Not yet"}</span>
                  </li>
                );
              })}
            </ul>
            <GoLink href="/history" className="inline-flex min-h-11 items-center self-start">Full role history</GoLink>
          </section>
        </div>
      )}
    </>
  );
}
