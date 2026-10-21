"use client";

import { useState } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleChip, RoleIcon } from "@/components/RoleChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { ProgressBar, Timeline, type TimelineItem } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { StateCard } from "@/components/ui/StateCard";
import { useDemo } from "@/lib/demo-store";
import { dayLabel, shortDate } from "@/lib/format";
import { ME_ID, projects } from "@/lib/mock-data";
import {
  activeRoles, assignmentFor, currentProject, doneRoleIds, getRole, groupOf, membersOf, nameOf,
  neverDone, nextProject, plannedRotation, previousProject, projectsSoFar, roleFor, theClass,
} from "@/lib/selectors";

/** WF11 · Role history. Students: own + table. Teachers: whole class + override with a reason. */
export function RoleHistoryScreen({ preview }: { preview: string }) {
  const { state } = useDemo();
  const teacher = state.viewAs === "admin";

  return (
    <>
      <PreviewBar
        current={{ state: preview }}
        groups={[{ param: "state", label: "State", options: [["", "Default"], ["denied", "Student opens class grid"]] }]}
      />
      {teacher ? (
        <ClassHistory />
      ) : preview === "denied" ? (
        <>
          <ScreenHeader id="WF11" title="Role history" />
          <StateCard kind="denied" title="Only teachers see the whole class" action={<LinkButton href="/history" kind="primary">See my history</LinkButton>}>
            You can see your own and your table’s history.
          </StateCard>
        </>
      ) : (
        <MyHistory />
      )}
    </>
  );
}

function MyHistory() {
  const { state } = useDemo();
  const table = groupOf(state, ME_ID);
  const done = doneRoleIds(state, ME_ID);
  const roles = activeRoles(state);
  const later = projects.filter((p) => p.number > currentProject.number + 1);

  const items: TimelineItem[] = [
    ...projectsSoFar.map((p): TimelineItem => {
      const a = assignmentFor(state, ME_ID, p.id);
      const r = getRole(state, a?.roleId);
      const how = a?.source === "chosen" ? "you picked" : a?.source === "override" ? "changed by teacher" : "rotated";
      const now = p.id === currentProject.id;
      return {
        title: `P${p.number} · ${p.name}`,
        sub: r ? `${r.icon} ${r.name} · ${how}${now ? " · now" : ""}` : "Not in a table",
        done: !now,
        current: now,
      };
    }),
    ...(nextProject ? [{ title: `P${nextProject.number} · ${nextProject.name}`, sub: `Set by rotation on ${dayLabel(nextProject.startDate)}` }] : []),
    ...(later.length ? [{ title: `P${later[0].number} – P${later[later.length - 1].number}`, sub: "Not started" }] : []),
  ];

  return (
    <>
      <ScreenHeader id="WF11" title="My role history" sub={`${nameOf(ME_ID)}${table ? ` · ${table.name}` : ""}`} />
      <BlockGrid>
        <Block span={7} strong label="Timeline">
          <Timeline items={items} />
        </Block>
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Block label="Coverage">
            <ProgressBar label="Roles done" value={done.size / roles.length} note={`${done.size}/${roles.length}`} />
            <p className="text-xs text-muted">Still to try</p>
            <ul className="flex flex-wrap gap-1.5">
              {neverDone(state, ME_ID).map((r) => (
                <li key={r.id}>
                  <RoleChip role={r} dashed />
                </li>
              ))}
            </ul>
          </Block>
          {table && (
            <Block label={`${table.name} history`}>
              <HistoryTable studentIds={membersOf(table)} />
            </Block>
          )}
        </div>
      </BlockGrid>
    </>
  );
}

function HistoryTable({ studentIds }: { studentIds: string[] }) {
  const { state } = useDemo();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b-[1.5px] border-ink">
            <th scope="col" className="py-1.5 pr-2 font-semibold">Name</th>
            {projectsSoFar.map((p) => (
              <th key={p.id} scope="col" className="py-1.5 pr-2 font-semibold">P{p.number}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {studentIds.map((id) => (
            <tr key={id} className="border-b border-line-soft">
              <th scope="row" className={`py-1.5 pr-2 font-medium ${id === ME_ID ? "font-bold" : ""}`}>{nameOf(id)}</th>
              {projectsSoFar.map((p) => {
                const r = roleFor(state, id, p.id);
                return (
                  <td key={p.id} className="py-1.5 pr-2">
                    {r ? (
                      <span className="inline-flex items-center gap-1">
                        <RoleIcon role={r} size="sm" /> {r.name}
                      </span>
                    ) : "—"}
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

function ClassHistory() {
  const { state, override, toast } = useDemo();
  const [table, setTable] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const roles = activeRoles(state);
  const planned = plannedRotation(state);

  const rows = theClass.studentIds.filter((id) => table === "all" || groupOf(state, id)?.id === table);
  const avg = rows.length ? rows.reduce((n, id) => n + doneRoleIds(state, id).size, 0) / rows.length : 0;
  const overrides = state.assignments.filter((a) => a.source === "override");

  const open = (id: string) => {
    setEditing(id);
    setNewRole(assignmentFor(state, id, currentProject.id)?.roleId ?? "");
    setReason("");
    setReasonError(false);
  };
  const lastRoleId = editing && previousProject ? assignmentFor(state, editing, previousProject.id)?.roleId : undefined;
  const breaksRule = !!newRole && newRole === lastRoleId;

  const save = () => {
    if (!editing) return;
    if (!reason.trim()) return setReasonError(true);
    override(editing, newRole, reason.trim());
    toast(`Saved. ${nameOf(editing)} is now ${getRole(state, newRole)?.name} for Project ${currentProject.number}.`);
    setEditing(null);
  };

  return (
    <>
      <ScreenHeader
        id="WF11"
        title="Role history"
        sub={`CS 3A · Project ${previousProject?.number ?? 1} done · Project ${currentProject.number} now${nextProject ? ` · P${nextProject.number} rotates ${shortDate(nextProject.startDate)}` : ""}`}
      />
      <BlockGrid>
        <Block span={12} bare>
          <div className="flex flex-wrap items-center gap-4">
            <Segmented
              label="Filter by table"
              options={[["all", "All"], ...state.groups.map((g) => [g.id, g.name] as [string, string])]}
              value={table}
              onChange={setTable}
            />
            <div className="min-w-56 flex-1">
              <ProgressBar label="Class coverage · average" value={avg / roles.length} note={`${avg.toFixed(1)}/${roles.length}`} />
            </div>
          </div>
        </Block>

        <Block span={12} strong label="Students × projects">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b-[1.5px] border-ink">
                  <th scope="col" className="py-2 pr-2 font-semibold">Student</th>
                  {projectsSoFar.map((p) => (
                    <th key={p.id} scope="col" className="py-2 pr-2 font-semibold">
                      P{p.number}{p.id === currentProject.id && " · now"}
                    </th>
                  ))}
                  {nextProject && <th scope="col" className="py-2 pr-2 font-semibold">P{nextProject.number} · planned</th>}
                  <th scope="col" className="py-2 pr-2 font-semibold">Done</th>
                  <th scope="col" className="py-2 pr-2 font-semibold">Never done</th>
                  <th scope="col" className="py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((id) => {
                  const plannedRole = getRole(state, planned[id]);
                  return (
                    <tr key={id} className="border-b border-line-soft">
                      <th scope="row" className="whitespace-nowrap py-1.5 pr-2 font-semibold">{nameOf(id)}</th>
                      {projectsSoFar.map((p) => {
                        const a = assignmentFor(state, id, p.id);
                        const r = getRole(state, a?.roleId);
                        return (
                          <td key={p.id} className="py-1.5 pr-2" title={a?.overrideReason}>
                            {r ? <RoleChip role={r} edited={a?.source === "override"} /> : "—"}
                          </td>
                        );
                      })}
                      {nextProject && (
                        <td className="py-1.5 pr-2">{plannedRole ? <RoleChip role={plannedRole} dashed /> : "—"}</td>
                      )}
                      <td className="py-1.5 pr-2 font-mono font-semibold">
                        {doneRoleIds(state, id).size}/{roles.length}
                      </td>
                      <td className="py-1.5 pr-2">
                        <span className="flex gap-0.5">
                          {neverDone(state, id).map((r) => (
                            <span key={r.id} title={r.name}>
                              <RoleIcon role={r} dashed size="sm" />
                              <span className="sr-only">{r.name}</span>
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="py-1.5 text-right">
                        <Button small onClick={() => open(id)} aria-label={`Override ${nameOf(id)}’s role`}>Override</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">
            ✎ = changed by teacher. Override needs a reason, which is saved to history. Planned roles come from the rotation rules and can still change.
          </p>
        </Block>

        <Block span={12} label={`Override log · ${overrides.length}`}>
          {overrides.length === 0 ? (
            <p className="text-sm text-muted">No overrides yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {overrides.map((a) => (
                <li key={`${a.studentId}-${a.projectId}`} className="flex flex-wrap items-center gap-2">
                  <b>{nameOf(a.studentId)}</b> · P{projects.find((p) => p.id === a.projectId)?.number} ·{" "}
                  {getRole(state, a.roleId) && <RoleChip role={getRole(state, a.roleId)!} edited />}
                  <span className="text-ink-2">“{a.overrideReason}”</span>
                </li>
              ))}
            </ul>
          )}
        </Block>
      </BlockGrid>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Change P${currentProject.number} role for ${nameOf(editing)}` : ""}
        actions={
          <>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button kind="primary" onClick={save} disabled={!newRole}>Save</Button>
          </>
        }
      >
        <fieldset className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          <legend className="mb-1 font-semibold text-ink">Pick a role</legend>
          {roles.map((r) => (
            <label key={r.id} className="flex cursor-pointer items-center gap-2 rounded border-[1.5px] border-line px-2.5 py-1.5 has-checked:border-ink has-checked:bg-fill-soft">
              <input type="radio" name="override-role" className="sr-only" checked={newRole === r.id} onChange={() => setNewRole(r.id)} />
              <RoleIcon role={r} size="sm" /> {r.name}
            </label>
          ))}
        </fieldset>
        {breaksRule && (
          <Banner kind="alert">
            {nameOf(editing!).split(" ")[0]} had {getRole(state, lastRoleId)?.name} last project. This breaks the no-repeat rule.
          </Banner>
        )}
        <Field
          label="Reason (required)"
          multiline
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setReasonError(false);
          }}
          error={reasonError ? "Add a reason. Reasons are saved to role history." : undefined}
          hint="Saved to role history. The student sees it on their role page."
        />
      </Modal>
    </>
  );
}
