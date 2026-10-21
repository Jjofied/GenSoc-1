"use client";

import { useState, type ReactNode } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleIcon } from "@/components/RoleChip";
import { RoleGate } from "@/components/RoleGate";
import { RoundTable } from "@/components/RoundTable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { Button, LinkButton } from "@/components/ui/Button";
import { StateCard } from "@/components/ui/StateCard";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { NEW_ROLE_GLYPHS } from "@/lib/mock-data";
import { membersOf, theClass } from "@/lib/selectors";
import type { Role } from "@/lib/types";

const MIN_GROUPS = 1;
const MAX_GROUPS = 12;
const MIN_SEATS = 2;
const MAX_SEATS = 12;
/** Live preview draws this many tables, then says "+ N more". */
const PREVIEW_TABLES = 6;

const card = "flex min-w-0 flex-col rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-md";
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** −  n  + counter with a label above. `invalid` draws the red error border. */
function Counter({ id, label, value, min, max, invalid, onChange }: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  invalid?: boolean;
  onChange: (n: number) => void;
}) {
  const btn = "h-12 w-12 text-[22px] hover:bg-mint-hover disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="font-bold">{label}</span>
      <div
        role="group"
        aria-labelledby={id}
        aria-describedby={invalid ? "setup-errors" : undefined}
        className={cn("flex w-max items-center overflow-hidden rounded-xl bg-white", invalid ? "border-2 border-bad-dot" : "border-[1.5px] border-ink")}
      >
        <button type="button" aria-label={`Fewer: ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>
          −
        </button>
        <output aria-live="polite" className="min-w-14 text-center text-[22px] font-bold">
          {value}
        </output>
        <button type="button" aria-label={`More: ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
          +
        </button>
      </div>
    </div>
  );
}

function Denied() {
  return (
    <div className="mx-auto mt-6 max-w-[520px] md:mt-10">
      <StateCard
        kind="denied"
        title="Only teachers can change group setup"
        action={
          <>
            <LinkButton href="/groups" kind="primary">See the round table</LinkButton>
            <LinkButton href="/student">Back to dashboard</LinkButton>
          </>
        }
      >
        You’re signed in as a student. You can still see every table and its members on the round table.
      </StateCard>
    </div>
  );
}

/** HF06 · Group setup: tables, seats, roles, sharing, rotation rules. */
export function GroupSetup({ preview }: { preview: string }) {
  const { state, saveSetup } = useDemo();
  const [groupCount, setGroupCount] = useState(state.groups.length);
  const [seats, setSeats] = useState(preview === "error" ? 5 : state.groups[0]?.seats.length ?? 6);
  const [roles, setRoles] = useState<Role[]>(state.roles);
  const [shareChoice, setShareChoice] = useState(state.groups[0]?.allowSharedRoles ?? true);
  const [saved, setSaved] = useState(preview === "saved");

  const previewBar = (
    <PreviewBar
      current={{ state: preview }}
      groups={[{ param: "state", label: "State", options: [["", "Default"], ["error", "Seats fewer than roles"], ["saved", "Saved"], ["denied", "Student opens setup"]] }]}
    />
  );

  if (preview === "denied" || state.viewAs === "student")
    return (
      <>
        {previewBar}
        <Denied />
      </>
    );

  const live = roles.filter((r) => !r.archived);
  const rc = live.length;
  const students = theClass.studentIds.length;
  const capacity = groupCount * seats;
  const mustShare = seats > rc;
  const allowShared = mustShare || shareChoice;

  // Seats vs roles: the one rule the design calls out as the headline error.
  let mismatch = "";
  if (seats < rc) {
    const gap = rc - seats;
    mismatch = `Each group has ${seats} seats but you’re using ${rc} roles, so ${plural(gap, "role")} would have nobody. Add ${gap > 1 ? `${gap} seats` : "a seat"}, or remove ${gap > 1 ? `${gap} roles` : "a role"}.`;
  } else if (seats > rc * 2) {
    mismatch = `Even with sharing, ${rc} roles can cover at most ${rc * 2} seats. Add a role or remove a seat.`;
  }

  // Other blocking problems: saving would drop seated students, or a role has no name.
  const problems: string[] = [];
  state.groups.forEach((g, i) => {
    const n = membersOf(g).length;
    if (i >= groupCount && n > 0) problems.push(`${g.name} has ${n} people. Move them before removing the table.`);
    else if (i < groupCount && n > seats) problems.push(`${g.name} has ${n} people. Move someone before dropping to ${seats} seats.`);
  });
  if (live.some((r) => !r.name.trim())) problems.push("Give every role a name.");

  const blocked = !!mismatch || problems.length > 0;

  let warning = "";
  if (!mismatch && mustShare)
    warning = `${seats} seats, ${rc} roles: role sharing turned on automatically, so ${seats - rc} ${seats - rc > 1 ? "roles get" : "role gets"} two people.`;
  else if (!mismatch && capacity < students)
    warning = `${capacity} seats for ${students} students — ${plural(students - capacity, "student")} won’t have a seat.`;

  const tables = Array.from({ length: Math.min(groupCount, PREVIEW_TABLES) }, (_, i) => {
    const members = state.groups[i] ? membersOf(state.groups[i]) : [];
    return { name: `Table ${i + 1}`, seats: Array.from({ length: seats }, (_, index) => ({ index, studentId: members[index] ?? null })) };
  });

  // Any edit clears the "Saved" banner.
  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setSaved(false);
  };
  const rename = (id: string, name: string) => edit(setRoles)(roles.map((r) => (r.id === id ? { ...r, name } : r)));
  const remove = (id: string) => edit(setRoles)(roles.map((r) => (r.id === id ? { ...r, archived: true } : r)));
  const add = () =>
    edit(setRoles)([
      ...roles,
      {
        id: `r-custom-${roles.length + 1}`,
        classId: theClass.id,
        name: "New role",
        icon: NEW_ROLE_GLYPHS[roles.length % NEW_ROLE_GLYPHS.length],
        focus: "Added by the teacher",
        tasks: [],
      },
    ]);

  const save = () => {
    if (blocked) return;
    saveSetup({ groupCount, seatsPerGroup: seats, roles, allowSharedRoles: allowShared });
    setSaved(true);
  };

  let banners: ReactNode = null;
  if (mismatch || problems.length > 0)
    banners = (
      <>
        {mismatch && (
          <Banner kind="alert">
            <b>Seats and roles don’t match.</b> {mismatch}
          </Banner>
        )}
        {problems.map((p) => (
          <Banner key={p} kind="alert">{p}</Banner>
        ))}
      </>
    );

  return (
    <RoleGate allow="admin" title="Only teachers can change group setup" message="You can still see every table." action={{ href: "/groups", label: "See the round table" }}>
      {previewBar}
      <ScreenHeader
        title="Group setup"
        kicker={`${theClass.name} · ${students} students`}
        actions={
          <Button kind="primary" onClick={save} disabled={blocked} aria-describedby={blocked ? "setup-errors" : undefined}>
            Save setup
          </Button>
        }
      />

      <div id="setup-errors" className="mb-4 flex flex-col gap-2 empty:hidden">
        {saved && !blocked && (
          <Banner kind="success">
            <b>Saved.</b> Students now see {plural(groupCount, "table")} with {seats} seats each.
          </Banner>
        )}
        {banners}
        {warning && <Banner kind="locked">{warning}</Banner>}
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
          <section aria-labelledby="h-table" className={cn(card, "gap-4")}>
            <h2 id="h-table" className="text-xl font-bold">1 · Round table</h2>
            <div className="flex flex-wrap gap-x-8 gap-y-5">
              <Counter id="lbl-groups" label="Number of groups" value={groupCount} min={MIN_GROUPS} max={MAX_GROUPS} onChange={edit(setGroupCount)} />
              <Counter id="lbl-seats" label="Seats per group" value={seats} min={MIN_SEATS} max={MAX_SEATS} invalid={!!mismatch} onChange={edit(setSeats)} />
            </div>
            <span className="text-[15px] text-muted">
              {groupCount} × {seats} = <b className="text-ink">{capacity} seats</b> for {students} students
            </span>
          </section>

          <section aria-labelledby="h-roles" className={cn(card, "gap-1.5")}>
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="h-roles" className="text-xl font-bold">2 · Roles</h2>
              <span className="text-[15px] text-muted">{plural(rc, "role")}</span>
            </div>
            <p className="mb-1.5 text-[15px] text-muted">Rename, add, or remove roles. Each role keeps its icon and color everywhere.</p>
            <ul className="flex flex-col">
              {live.map((r) => (
                <li key={r.id} className="flex items-center gap-2.5 border-b border-mint-2 py-1.5">
                  <RoleIcon role={r} />
                  <input
                    value={r.name}
                    onChange={(e) => rename(r.id, e.target.value)}
                    aria-label={`Role name: ${r.name || "unnamed"}`}
                    aria-invalid={!r.name.trim() || undefined}
                    placeholder="Role name"
                    className={cn(
                      "h-11 min-w-0 flex-1 rounded-[10px] bg-white px-3 text-ink focus:outline-3 focus:outline-offset-2 focus:outline-ink",
                      r.name.trim() ? "border-[1.5px] border-muted-line" : "border-2 border-bad-dot",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    disabled={rc <= 1}
                    aria-label={`Remove ${r.name || "role"}`}
                    className="h-11 flex-none rounded-[10px] border-[1.5px] border-muted-line bg-white px-3 text-[15px] hover:border-ink disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <Button kind="dashed" onClick={add} className="mt-2 self-start">＋ Add a role</Button>
            <p className="text-sm text-muted">Removed roles stay in past role history.</p>
          </section>

          <section aria-label="Role sharing" className={card}>
            <div className="flex items-center justify-between gap-3">
              <span id="lbl-share">
                <b>Allow two people to share a role</b>
                <br />
                <span className="text-[15px] text-muted">
                  {mustShare ? "On automatically: more seats than roles." : "Turns on automatically when seats are more than roles."}
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={allowShared}
                aria-labelledby="lbl-share"
                disabled={mustShare}
                onClick={() => edit(setShareChoice)(!shareChoice)}
                className={cn(
                  "flex h-11 w-14 flex-none items-center disabled:cursor-not-allowed",
                  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink",
                )}
              >
                <span className={cn("flex h-8 w-14 rounded-full p-[3px]", allowShared ? "justify-end bg-ink" : "justify-start bg-muted-2")}>
                  <span className="h-[26px] w-[26px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]" />
                </span>
              </button>
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-[1.2_1_380px] flex-col gap-4">
          <section aria-labelledby="h-preview" className={cn(card, "gap-3")}>
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="h-preview" className="text-xl font-bold">Live preview</h2>
              <span className="text-sm text-muted">What students see</span>
            </div>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
              {tables.map((t) => (
                <li key={t.name} className="flex flex-col items-center gap-1.5 rounded-xl border border-mint-2 px-1.5 py-2.5">
                  <RoundTable label={t.name.replace("Table ", "T")} seats={t.seats} size="sm" />
                  <b className="text-[15px]">{t.name}</b>
                  <span className="sr-only">{seats} seats</span>
                </li>
              ))}
            </ul>
            {groupCount > PREVIEW_TABLES && <span className="text-sm text-muted">+ {plural(groupCount - PREVIEW_TABLES, "more table")}</span>}
          </section>

          <section aria-labelledby="h-rotation" className="flex min-w-0 flex-col gap-2.5 rounded-2xl border-[1.5px] border-ink bg-mint p-5 shadow-hard-md">
            <h2 id="h-rotation" className="text-lg font-bold">3 · Rotation</h2>
            <p className="text-[17px] font-bold">Roles auto-rotate each new project. No repeats back-to-back.</p>
            <ol className="flex list-decimal flex-col gap-1.5 pl-[22px]">
              <li><b>Project 1:</b> students choose their own role.</li>
              <li><b>Project 2 onward:</b> roles rotate automatically.</li>
              <li>No one gets the same role two projects in a row.</li>
              <li>You can override any role — you’ll be asked for a reason.</li>
            </ol>
            <span className="text-sm text-muted">Roles are never linked to personal details. groupme doesn’t collect gender.</span>
          </section>
        </div>
      </div>
    </RoleGate>
  );
}
