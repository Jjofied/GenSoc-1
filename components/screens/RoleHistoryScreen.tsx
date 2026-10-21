"use client";

import { useState, type ReactNode } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleChip, RoleIcon } from "@/components/RoleChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Timeline, type TimelineItem } from "@/components/ui/Bits";
import { Block } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { StateCard } from "@/components/ui/StateCard";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { dayLabel, monthLabel, shortDate } from "@/lib/format";
import { ME_ID, projects } from "@/lib/mock-data";
import {
  activeRoles, assignmentFor, currentProject, doneRoleIds, getRole, groupOf, membersOf, nameOf,
  neverDone, nextProject, plannedRotation, previousProject, projectsSoFar, repeatCount, roleFor, theClass,
} from "@/lib/selectors";
import type { Assignment } from "@/lib/types";

/** "CS 3A" from "CS 3A – Software Engineering". */
const CLASS_SHORT = theClass.name.split(" – ")[0];

const HOW: Record<Assignment["source"], string> = { chosen: "You picked", rotated: "Rotated", override: "Changed by teacher" };

/** WF11 · Role history. Students: own + table. Teachers: whole class + override with a reason. */
export function RoleHistoryScreen({ preview }: { preview: string }) {
  const { state } = useDemo();
  const teacher = state.viewAs === "admin";

  return (
    <>
      <PreviewBar
        current={{ state: preview }}
        groups={[
          {
            param: "state",
            label: "State",
            options: [["", "Default"], ["override", "Teacher override open"], ["denied", "Student opens class grid"]],
          },
        ]}
      />
      {teacher ? (
        // Remount when the preview changes so "override" opens the modal fresh.
        <ClassHistory key={preview} openFirst={preview === "override"} />
      ) : preview === "denied" ? (
        <>
          <ScreenHeader id="WF11" title="Role history" />
          <div className="max-w-[560px]">
            <StateCard
              kind="denied"
              title="Only teachers can see the whole class"
              action={<LinkButton href="/history" kind="primary">See my history</LinkButton>}
            >
              You can see your own role history and your table’s. Ask {nameOf(theClass.adminId)} if you have questions about rotation.
            </StateCard>
          </div>
        </>
      ) : (
        <MyHistory />
      )}
    </>
  );
}

/** Coverage meter: ink fill on a mint track. */
function Meter({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const pct = max ? Math.round(Math.min(1, value / max) * 100) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value * 10) / 10}
      className={cn("h-3 overflow-hidden rounded-full bg-mint-2", className)}
    >
      <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
    </div>
  );
}

function MyHistory() {
  const { state } = useDemo();
  const table = groupOf(state, ME_ID);
  const done = doneRoleIds(state, ME_ID);
  const roles = activeRoles(state);

  const items: TimelineItem[] = projects.map((p): TimelineItem => {
    const now = p.id === currentProject.id;
    const past = p.number <= currentProject.number;
    const a = past ? assignmentFor(state, ME_ID, p.id) : undefined;
    const r = getRole(state, a?.roleId);
    const dates = past
      ? `${shortDate(p.startDate)} – ${shortDate(p.dueDate)}${now ? " · now" : ""}`
      : p.id === nextProject?.id
        ? `Starts ${dayLabel(p.startDate)}`
        : monthLabel(p.startDate);

    let sub: ReactNode;
    if (a && r) {
      sub = (
        <span className="mt-1.5 flex flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <RoleChip role={r} />
            <span className="rounded-md bg-mint-2 px-2 py-0.5 text-sm font-bold text-ink">{HOW[a.source]}</span>
          </span>
          {a.source === "override" && a.overrideReason && <span className="text-sm">“{a.overrideReason}”</span>}
        </span>
      );
    } else if (past) {
      sub = "Not in a table";
    } else if (p.id === nextProject?.id) {
      sub = "Your role is set by rotation when the project starts.";
    } else {
      sub = "Not started";
    }

    return {
      title: (
        <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span>Project {p.number} · {p.name}</span>
          <span className="text-sm font-normal text-muted">{dates}</span>
        </span>
      ),
      sub,
      done: past && !now,
      current: now,
    };
  });

  return (
    <>
      <ScreenHeader
        id="WF11"
        kicker={`${CLASS_SHORT} · ${nameOf(ME_ID)}${table ? ` · ${table.name}` : ""}`}
        title="My role history"
      />
      <div className="flex flex-wrap items-start gap-4">
        <Block label="Timeline" className="flex-[1.3_1_360px]">
          <Timeline items={items} />
        </Block>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <Block>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold">Coverage</h2>
              <b>{done.size} of {roles.length} roles</b>
            </div>
            <Meter value={done.size} max={roles.length} label="Roles you’ve done" />
            <span className="text-[15px] text-muted">Still to try</span>
            <ul className="flex flex-wrap gap-1.5">
              {neverDone(state, ME_ID).map((r) => (
                <li key={r.id}>
                  <RoleChip role={r} dashed size="sm" />
                </li>
              ))}
            </ul>
          </Block>
          {table && (
            <Block label={table.name}>
              <HistoryTable studentIds={membersOf(table)} />
            </Block>
          )}
        </div>
      </div>
    </>
  );
}

function HistoryTable({ studentIds }: { studentIds: string[] }) {
  const { state } = useDemo();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-[15px]">
        <thead>
          <tr>
            <th scope="col" className="w-[110px] py-1.5 pr-2 text-sm font-bold text-muted">Name</th>
            {projectsSoFar.map((p) => (
              <th key={p.id} scope="col" className="py-1.5 pr-2 text-sm font-bold text-muted">Project {p.number}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {studentIds.map((id) => (
            <tr key={id} className="border-t border-mint-2">
              <th scope="row" className={cn("py-1.5 pr-2", id === ME_ID ? "font-bold" : "font-normal")}>
                {nameOf(id)}
                {id === ME_ID && <span className="sr-only"> (you)</span>}
              </th>
              {projectsSoFar.map((p) => {
                const r = roleFor(state, id, p.id);
                return (
                  <td key={p.id} className="py-1.5 pr-2">
                    {r ? <RoleChip role={r} size="sm" /> : <span className="text-muted">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClassHistory({ openFirst }: { openFirst: boolean }) {
  const { state, override, toast } = useDemo();
  const roles = activeRoles(state);
  const planned = plannedRotation(state);
  const canOverride = (id: string) => !!assignmentFor(state, id, currentProject.id);

  const [table, setTable] = useState("all");
  // The "override" preview opens the modal on the first student who has a role this project.
  const [editing, setEditing] = useState<string | null>(() => (openFirst ? theClass.studentIds.find(canOverride) ?? null : null));
  const [newRole, setNewRole] = useState("");
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);

  const rows = theClass.studentIds.filter((id) => table === "all" || groupOf(state, id)?.id === table);
  const avg = theClass.studentIds.length
    ? theClass.studentIds.reduce((n, id) => n + doneRoleIds(state, id).size, 0) / theClass.studentIds.length
    : 0;
  const repeats = repeatCount(state);
  const overrides = state.assignments.filter((a) => a.source === "override");

  const open = (id: string) => {
    setEditing(id);
    setNewRole("");
    setReason("");
    setTried(false);
  };
  const currentRoleId = editing ? assignmentFor(state, editing, currentProject.id)?.roleId : undefined;
  const lastRoleId = editing && previousProject ? assignmentFor(state, editing, previousProject.id)?.roleId : undefined;
  const breaksRule = !!newRole && newRole === lastRoleId;
  const roleError = tried && !newRole;
  const reasonError = tried && !!newRole && !reason.trim();

  const save = () => {
    if (!editing) return;
    if (!newRole || !reason.trim()) return setTried(true);
    override(editing, newRole, reason.trim());
    toast(`${nameOf(editing)} is now ${getRole(state, newRole)?.name}. Reason saved.`);
    setEditing(null);
  };

  const heads = [
    ...projectsSoFar.map((p) => `Project ${p.number}${p.id === currentProject.id ? " · now" : ""}`),
    ...(nextProject ? [`Project ${nextProject.number} · planned`] : []),
  ];

  return (
    <>
      <ScreenHeader
        id="WF11"
        kicker={`${CLASS_SHORT} · ${previousProject ? `Project ${previousProject.number} done · ` : ""}Project ${currentProject.number} now${nextProject ? ` · Project ${nextProject.number} rotates ${dayLabel(nextProject.startDate)}` : ""}`}
        title="Role history"
        actions={
          <Segmented
            label="Show table"
            options={[["all", "All"], ...state.groups.map((g) => [g.id, g.name] as [string, string])]}
            value={table}
            onChange={setTable}
          />
        }
      />

      <div className="flex flex-col gap-4">
        <section
          aria-label="Class coverage"
          className="flex flex-wrap items-center gap-x-5 gap-y-2.5 rounded-[14px] border-[1.5px] border-ink bg-white px-[18px] py-3.5 shadow-hard-md"
        >
          <b>Class coverage</b>
          <Meter value={avg} max={roles.length} label="Class coverage, average roles per student" className="flex-[1_1_200px]" />
          <span>
            Average <b>{avg.toFixed(1).replace(/\.0$/, "")} of {roles.length}</b> roles per student · {repeats} {repeats === 1 ? "repeat" : "repeats"}
          </span>
          {roles[0] && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              <RoleIcon role={roles[roles.length - 1]} dashed size="sm" /> = never done yet
            </span>
          )}
          <span className="text-sm text-muted">
            <span aria-hidden>✎</span> = changed by teacher
          </span>
        </section>

        <section className="overflow-x-auto rounded-2xl border-[1.5px] border-ink bg-white shadow-hard-md">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <caption className="sr-only">Roles by student and project</caption>
            <thead>
              <tr className="bg-mint">
                <th scope="col" className="w-[130px] border-b-[1.5px] border-ink p-3 text-sm font-bold text-muted">Student</th>
                {heads.map((h) => (
                  <th key={h} scope="col" className="border-b-[1.5px] border-ink p-3 text-sm font-bold text-muted">{h}</th>
                ))}
                <th scope="col" className="w-[120px] border-b-[1.5px] border-ink p-3 text-sm font-bold text-muted">Coverage</th>
                <th scope="col" className="w-[140px] border-b-[1.5px] border-ink p-3 text-sm font-bold text-muted">Never done</th>
                <th scope="col" className="w-[150px] border-b-[1.5px] border-ink p-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((id) => {
                const plannedRole = getRole(state, planned[id]);
                const doneCount = doneRoleIds(state, id).size;
                return (
                  <tr key={id} className="border-b border-mint-2 last:border-b-0">
                    <th scope="row" className="px-3 py-2.5 text-left">
                      <span className="block font-bold">{nameOf(id)}</span>
                      <span className="block text-[13px] font-normal text-muted">{groupOf(state, id)?.name ?? "No table"}</span>
                    </th>
                    {projectsSoFar.map((p) => {
                      const a = assignmentFor(state, id, p.id);
                      const r = getRole(state, a?.roleId);
                      const changed = a?.source === "override";
                      return (
                        <td key={p.id} className={cn("px-3 py-2.5", changed && "bg-[#fdf6e6]")} title={a?.overrideReason}>
                          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                            {r ? <RoleChip role={r} size="sm" /> : <span className="text-muted">—</span>}
                            {changed && (
                              <span className="text-xs font-bold text-warn">
                                <span aria-hidden>✎ </span>changed<span className="sr-only"> by teacher: {a?.overrideReason}</span>
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                    {nextProject && (
                      <td className="px-3 py-2.5">
                        {plannedRole ? (
                          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                            <RoleIcon role={plannedRole} size="sm" /> {plannedRole.name}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-2.5">
                      <span className="flex flex-col gap-1">
                        <span className="text-[13px] font-bold">{doneCount} / {roles.length}</span>
                        <Meter value={doneCount} max={roles.length} label={`${nameOf(id)} coverage`} className="h-2" />
                      </span>
                    </td>
                    <td className="bg-[#fdfaf2] px-3 py-2.5">
                      <ul className="flex flex-wrap items-center gap-1" aria-label={`Never done by ${nameOf(id)}`}>
                        {neverDone(state, id).map((r) => (
                          <li key={r.id} title={r.name}>
                            <RoleIcon role={r} dashed size="sm" />
                            <span className="sr-only">{r.name}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => open(id)}
                        disabled={!canOverride(id)}
                        aria-label={`Override Project ${currentProject.number} role for ${nameOf(id)}`}
                        className="press min-h-11 whitespace-nowrap rounded-[10px] border-[1.5px] border-ink bg-white px-3 text-sm font-bold text-ink shadow-hard-sm hover:bg-mint-hover disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Override role
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <Block label={`Override log · ${overrides.length}`}>
          {overrides.length === 0 ? (
            <p className="text-[15px] text-muted">No overrides yet. Reasons you give are saved here.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-[15px]">
              {overrides.map((a) => {
                const r = getRole(state, a.roleId);
                return (
                  <li key={`${a.studentId}-${a.projectId}`} className="flex flex-wrap items-center gap-2">
                    <b>{nameOf(a.studentId)}</b>
                    <span className="text-muted">· Project {projects.find((p) => p.id === a.projectId)?.number} ·</span>
                    {r && <RoleChip role={r} size="sm" edited />}
                    <span className="text-ink-2">“{a.overrideReason}”</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Block>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Change Project ${currentProject.number} role for ${nameOf(editing)}` : ""}
        actions={
          <>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button kind="primary" onClick={save}>Save change</Button>
          </>
        }
      >
        {currentRoleId && getRole(state, currentRoleId) && (
          <p className="flex flex-wrap items-center gap-2 text-[15px] text-muted">
            Current: <RoleChip role={getRole(state, currentRoleId)!} size="sm" />
          </p>
        )}
        <fieldset aria-invalid={roleError || undefined} className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-bold text-ink">New role</legend>
          {roles.map((r) => {
            const isCurrent = r.id === currentRoleId;
            const isPrev = r.id === lastRoleId;
            return (
              <label
                key={r.id}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-[10px] px-2.5",
                  newRole === r.id ? "border-2 border-ink" : "border-[1.5px] border-ink",
                  isCurrent ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:bg-mint",
                )}
              >
                <input
                  type="radio"
                  name="override-role"
                  className="h-[18px] w-[18px] flex-none accent-primary"
                  checked={newRole === r.id}
                  disabled={isCurrent}
                  onChange={() => setNewRole(r.id)}
                />
                <RoleChip role={r} size="sm" />
                <span className="ml-auto text-right text-[13px] text-muted">
                  {isCurrent ? "Current role" : isPrev ? `Project ${previousProject?.number} role · breaks no-repeat` : ""}
                </span>
              </label>
            );
          })}
        </fieldset>
        {breaksRule && editing && (
          <div role="alert" className="rounded-[10px] border border-warn-dot/50 bg-warn-bg px-3 py-2.5 text-[15px] text-warn">
            <b>Heads up: this breaks the no-repeat rule.</b> {nameOf(editing)} had this role in Project {previousProject?.number}. You can still
            save — your reason will show in role history.
          </div>
        )}
        {roleError && (
          <p role="alert" className="text-sm font-bold text-bad">Pick a new role.</p>
        )}
        <Field
          label="Reason · required"
          multiline
          rows={2}
          value={reason}
          placeholder="e.g. Accessibility accommodation for demo day"
          onChange={(e) => setReason(e.target.value)}
          error={reasonError ? "Add a reason — it’s saved in role history." : undefined}
          hint="Saved in role history. The student sees it on their role history."
        />
      </Modal>
    </>
  );
}
