"use client";

import { useState } from "react";
import { GroupStatusLabel, StatusLegend } from "@/components/GroupStatusLabel";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleChip } from "@/components/RoleChip";
import { RoundTable } from "@/components/RoundTable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StateCard } from "@/components/ui/StateCard";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { dayLabel } from "@/lib/format";
import { ME_ID, TEACHER_ID } from "@/lib/mock-data";
import { currentProject, groupOf, groupStatus, membersOf, nameOf, openSeats, roleFor } from "@/lib/selectors";
import type { Group } from "@/lib/types";

type Pending =
  | { kind: "switch"; to: Group; seatIndex?: number }
  | { kind: "move"; studentId: string }
  | null;

/** WF07 · Round table (canvas Option A · Round tables). Students sit/switch/leave; teachers move anyone. */
export function RoundTables({ preview, fix }: { preview: string; fix: string }) {
  const { state, move, createGroup, toast } = useDemo();
  const [pending, setPending] = useState<Pending>(null);
  const [moveTo, setMoveTo] = useState("");
  const teacher = state.viewAs === "admin";
  // "open" previews the phase before the project starts, when students can still switch.
  const started = preview === "open" ? false : currentProject.status === "active";
  const groups = preview === "empty" ? [] : state.groups;
  const mine = groupOf(state, ME_ID);
  const studentCanChange = !teacher && !started;

  const sit = (to: Group, seatIndex?: number) => {
    if (mine) return setPending({ kind: "switch", to, seatIndex });
    move(ME_ID, to.id, seatIndex);
    toast(`You’re now at ${to.name}. Your table can see you.`);
  };

  const confirm = () => {
    if (pending?.kind === "switch") {
      move(ME_ID, pending.to.id, pending.seatIndex);
      toast(`You’re now at ${pending.to.name}. Your table can see you.`);
    } else if (pending?.kind === "move" && moveTo) {
      move(pending.studentId, moveTo);
      toast(`${nameOf(pending.studentId)} moved to ${state.groups.find((g) => g.id === moveTo)?.name}.`);
    }
    setPending(null);
    setMoveTo("");
  };

  return (
    <>
      <PreviewBar
        current={{ state: preview, ...(fix ? { fix } : {}) }}
        groups={[{ param: "state", label: "Phase / state", options: [["", "Live · project started"], ["open", "Open · before start"], ["empty", "No tables yet"]] }]}
      />
      <ScreenHeader id="WF07" title="Round table" sub={`Project ${currentProject.number} · ${currentProject.name}`} />

      {groups.length === 0 ? (
        <StateCard
          kind="empty"
          title="No tables yet"
          action={<LinkButton href={teacher ? "/admin/groups" : "/student"} kind="primary">{teacher ? "Set up tables" : "Back to dashboard"}</LinkButton>}
        >
          {teacher ? "Set the number of tables and seats in Group setup." : `${nameOf(TEACHER_ID)} is still setting up groups.`}
        </StateCard>
      ) : (
        <BlockGrid>
          <Block span={12} bare>
            {!started ? (
              <Banner>
                <b>Open:</b> join, leave or switch until Project {currentProject.number} starts on {dayLabel(currentProject.startDate)}.
              </Banner>
            ) : teacher ? (
              <Banner kind="locked">
                <b>Project {currentProject.number} has started.</b> Students can’t switch now. Use Move to fix a table.
              </Banner>
            ) : (
              <Banner kind="locked">
                <b>Group changes are closed.</b> Ask your teacher to move you.
              </Banner>
            )}
          </Block>

          <Block span={12} bare label="All tables">
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {groups.map((g) => {
                const status = groupStatus(g, started);
                const isMine = mine?.id === g.id;
                const full = openSeats(g) === 0;
                return (
                  <li
                    key={g.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-lg bg-white p-4",
                      isMine || fix === g.id ? "border-[2.5px] border-ink" : "border-[1.5px] border-line",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold">
                        {g.name}
                        {isMine && !teacher && " · you"}
                      </h3>
                      <GroupStatusLabel status={status} />
                    </div>
                    <RoundTable label={g.name} seats={g.seats} youId={teacher ? undefined : ME_ID} roleOf={(id) => roleFor(state, id, currentProject.id)} />
                    <ul className="flex flex-col gap-1.5" aria-label={`${g.name} seats`}>
                      {g.seats.map((seat) => {
                        const role = seat.studentId ? roleFor(state, seat.studentId, currentProject.id) : undefined;
                        return (
                          <li key={seat.index} className="flex min-h-7 flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
                            {seat.studentId ? (
                              <>
                                <span className={seat.studentId === ME_ID && !teacher ? "font-bold" : undefined}>
                                  {nameOf(seat.studentId)}
                                  {seat.studentId === ME_ID && !teacher && " (you)"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  {role && <RoleChip role={role} />}
                                  {teacher && (
                                    <Button small kind="ghost" onClick={() => setPending({ kind: "move", studentId: seat.studentId! })} aria-label={`Move ${nameOf(seat.studentId)}`}>
                                      Move
                                    </Button>
                                  )}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-muted">Empty seat</span>
                                {studentCanChange && !isMine && (
                                  <Button small onClick={() => sit(g, seat.index)}>Sit here</Button>
                                )}
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    {!teacher && (
                      <div className="mt-auto">
                        {isMine ? (
                          <Button
                            disabled={started}
                            onClick={() => {
                              move(ME_ID, null);
                              toast(`You left ${g.name}. Your seat is open.`);
                            }}
                          >
                            Leave
                          </Button>
                        ) : full ? (
                          <Button disabled>Full</Button>
                        ) : (
                          <Button kind="primary" disabled={started} onClick={() => sit(g)}>
                            {mine ? "Switch" : "Join"}
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Block>

          <Block span={12} bare>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                disabled={!teacher && started}
                onClick={() => {
                  createGroup();
                  toast(`Table ${state.groups.length + 1} created.`);
                }}
              >
                ＋ Create group
              </Button>
              <StatusLegend />
            </div>
          </Block>
        </BlockGrid>
      )}

      <Modal
        open={pending?.kind === "switch"}
        onClose={() => setPending(null)}
        title={pending?.kind === "switch" ? `Switch to ${pending.to.name}?` : ""}
        actions={
          <>
            <Button onClick={() => setPending(null)}>Cancel</Button>
            <Button kind="primary" onClick={confirm}>Switch</Button>
          </>
        }
      >
        <p>You’ll leave {mine?.name} and your seat opens up.</p>
      </Modal>

      <Modal
        open={pending?.kind === "move"}
        onClose={() => setPending(null)}
        title={pending?.kind === "move" ? `Move ${nameOf(pending.studentId)}` : ""}
        actions={
          <>
            <Button onClick={() => setPending(null)}>Cancel</Button>
            <Button kind="primary" onClick={confirm} disabled={!moveTo}>Move</Button>
          </>
        }
      >
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 font-semibold text-ink">Pick a table with an open seat</legend>
          {state.groups
            .filter((g) => pending?.kind === "move" && g.id !== groupOf(state, pending.studentId)?.id && openSeats(g) > 0)
            .map((g) => (
              <label key={g.id} className="flex items-center gap-2 rounded border-[1.5px] border-line px-3 py-2 has-checked:border-ink">
                <input type="radio" name="move-to" value={g.id} checked={moveTo === g.id} onChange={() => setMoveTo(g.id)} />
                {g.name} · {membersOf(g).length}/{g.seats.length}
              </label>
            ))}
        </fieldset>
        <p className="text-xs">Their role for this project stays the same.</p>
      </Modal>
    </>
  );
}
