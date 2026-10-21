"use client";

import { useState } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleIcon } from "@/components/RoleChip";
import { RoleGate } from "@/components/RoleGate";
import { RoundTable } from "@/components/RoundTable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { Timeline } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button } from "@/components/ui/Button";
import { Stepper, Toggle } from "@/components/ui/Field";
import { useDemo } from "@/lib/demo-store";
import { NEW_ROLE_GLYPHS } from "@/lib/mock-data";
import { membersOf, theClass } from "@/lib/selectors";
import type { Role } from "@/lib/types";

/** WF06 · Group setup: tables, seats, roles, sharing, rotation rules. */
export function GroupSetup({ preview }: { preview: string }) {
  const { state, saveSetup, toast } = useDemo();
  const [groupCount, setGroupCount] = useState(state.groups.length);
  const [seats, setSeats] = useState(preview === "error" ? 5 : state.groups[0]?.seats.length ?? 6);
  const [roles, setRoles] = useState<Role[]>(state.roles);
  const [shareChoice, setShareChoice] = useState(state.groups[0]?.allowSharedRoles ?? true);

  const live = roles.filter((r) => !r.archived);
  const students = theClass.studentIds.length;
  const mustShare = seats > live.length;
  const allowShared = mustShare || shareChoice;

  const problems: string[] = [];
  if (seats < live.length)
    problems.push(`${seats} seats but ${live.length} roles. One role would have nobody. Add a seat, or remove a role.`);
  state.groups.forEach((g, i) => {
    const n = membersOf(g).length;
    if (i >= groupCount && n > 0) problems.push(`${g.name} has ${n} people. Move them before removing the table.`);
    else if (i < groupCount && n > seats) problems.push(`${g.name} has ${n} people. Move someone before dropping to ${seats} seats.`);
  });
  if (groupCount * seats < students) problems.push(`${groupCount * seats} seats for ${students} students. Add a table or a seat.`);
  if (live.some((r) => !r.name.trim())) problems.push("Give every role a name.");

  const tables = Array.from({ length: groupCount }, (_, i) => {
    const members = state.groups[i] ? membersOf(state.groups[i]) : [];
    return { name: `Table ${i + 1}`, seats: Array.from({ length: seats }, (_, index) => ({ index, studentId: members[index] ?? null })) };
  });

  const rename = (id: string, name: string) => setRoles((rs) => rs.map((r) => (r.id === id ? { ...r, name } : r)));
  const remove = (id: string) => setRoles((rs) => rs.map((r) => (r.id === id ? { ...r, archived: true } : r)));
  const add = () =>
    setRoles((rs) => [
      ...rs,
      {
        id: `r-custom-${rs.length + 1}`,
        classId: theClass.id,
        name: "",
        icon: NEW_ROLE_GLYPHS[rs.length % NEW_ROLE_GLYPHS.length],
        focus: "Added by the teacher",
        tasks: [],
      },
    ]);

  const save = () => {
    saveSetup({ groupCount, seatsPerGroup: seats, roles, allowSharedRoles: allowShared });
    toast(`Saved. Students now see ${groupCount} tables × ${seats} seats.`);
  };

  return (
    <RoleGate allow="admin" title="Only teachers can change setup" message="You can still see every table." action={{ href: "/groups", label: "See round table" }}>
      <PreviewBar current={{ state: preview }} groups={[{ param: "state", label: "State", options: [["", "Default"], ["error", "Seats fewer than roles"]] }]} />
      <ScreenHeader id="WF06" title="Group setup" sub={`CS 3A · ${students} students`} />

      {problems.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {problems.map((p) => (
            <Banner key={p} kind="alert">{p}</Banner>
          ))}
        </div>
      )}

      <BlockGrid>
        <Block span={5} label="1 · Round table">
          <Stepper label="Number of groups" value={groupCount} min={1} max={10} onChange={setGroupCount} />
          <Stepper label="Seats per group" value={seats} min={2} max={10} onChange={setSeats} />
          <p className="text-xs text-muted">
            {groupCount} × {seats} = {groupCount * seats} seats for {students} students
          </p>
        </Block>

        <Block span={7} label="Live preview">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {tables.map((t) => (
              <li key={t.name} className="flex flex-col items-center gap-1">
                <RoundTable label={t.name.replace("Table ", "T")} seats={t.seats} size="sm" roleOf={() => undefined} />
                <span className="text-xs font-semibold">{t.name}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block span={7} label="2 · Roles">
          <ul className="flex flex-col gap-2">
            {live.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <RoleIcon role={r} />
                <label className="sr-only" htmlFor={`role-${r.id}`}>Role name</label>
                <input
                  id={`role-${r.id}`}
                  value={r.name}
                  onChange={(e) => rename(r.id, e.target.value)}
                  placeholder="Role name"
                  className="min-w-0 flex-1 rounded-md border-[1.5px] border-line bg-white px-2.5 py-1.5 text-sm"
                />
                <Button small kind="ghost" onClick={() => remove(r.id)} aria-label={`Remove ${r.name || "role"}`} disabled={live.length <= 1}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <Button small onClick={add} className="self-start">＋ Add a role</Button>
          <Toggle
            label={mustShare ? "Allow two people to share a role (on: more seats than roles)" : "Allow two people to share a role"}
            checked={allowShared}
            disabled={mustShare}
            onChange={setShareChoice}
          />
          <p className="text-xs text-muted">Removed roles stay in past role history.</p>
        </Block>

        <Block span={5} label="3 · Rotation">
          <p className="text-sm font-semibold">Roles auto-rotate each new project. No repeats back-to-back.</p>
          <Timeline
            items={[
              { title: "Project 1", sub: "Students choose", done: true },
              { title: "Project 2+", sub: "Roles auto-rotate" },
              { title: "Never", sub: "Same role twice in a row" },
              { title: "Override", sub: "Teacher only, with a reason" },
            ]}
          />
          <Button kind="primary" onClick={save} disabled={problems.length > 0} className="self-start">
            Save setup
          </Button>
        </Block>
      </BlockGrid>
    </RoleGate>
  );
}
