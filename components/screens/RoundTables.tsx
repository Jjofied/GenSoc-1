"use client";

import { useState, type ReactNode } from "react";
import { GroupStatusLabel, StatusLegend } from "@/components/GroupStatusLabel";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleChip } from "@/components/RoleChip";
import { RoundTable } from "@/components/RoundTable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button, LinkButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StateCard } from "@/components/ui/StateCard";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { dayLabel } from "@/lib/format";
import { ME_ID, TEACHER_ID } from "@/lib/mock-data";
import {
  activeRoles, currentProject, groupOf, groupStatus, membersOf, nameOf, openSeats, roleFor, seatedCount, theClass,
} from "@/lib/selectors";
import type { Group } from "@/lib/types";

type Pending =
  | { kind: "switch"; to: Group; seatIndex?: number }
  | { kind: "move"; studentId: string }
  | null;

/** HF07 · Round table (Option A · round tables). Students sit/switch/leave; teachers move anyone. */
export function RoundTables({ preview, fix }: { preview: string; fix: string }) {
  return (
    <>
      <PreviewBar
        current={{ state: preview, ...(fix ? { fix } : {}) }}
        groups={[
          {
            param: "state",
            label: "Phase / state",
            options: [["", "Live · project started"], ["open", "Open · before start"], ["confirm", "Confirm switch"], ["empty", "No tables yet"]],
          },
        ]}
      />
      {/* Keyed so a preview change resets the open dialog. */}
      <Tables key={preview} preview={preview} fix={fix} />
    </>
  );
}

function Tables({ preview, fix }: { preview: string; fix: string }) {
  const { state, move, createGroup, toast } = useDemo();
  const teacher = state.viewAs === "admin";
  const mine = groupOf(state, ME_ID);
  // "open" / "confirm" preview the phase before the project starts, when students can still switch.
  const started = preview === "open" || preview === "confirm" ? false : currentProject.status === "active";
  const groups = preview === "empty" ? [] : state.groups;
  const studentCanChange = !teacher && !started;
  const startsOn = dayLabel(currentProject.startDate);

  const [pending, setPending] = useState<Pending>(() => {
    if (preview !== "confirm" || teacher || !mine) return null;
    const to = state.groups.find((g) => g.id !== mine.id && openSeats(g) > 0);
    return to ? { kind: "switch", to } : null;
  });
  const [moveTo, setMoveTo] = useState("");

  const sit = (to: Group, seatIndex?: number) => {
    if (mine) return setPending({ kind: "switch", to, seatIndex });
    move(ME_ID, to.id, seatIndex);
    toast(`You’re now at ${to.name}.`);
  };

  const confirm = () => {
    if (pending?.kind === "switch") {
      move(ME_ID, pending.to.id, pending.seatIndex);
      toast(`You’re now at ${pending.to.name}.`);
    } else if (pending?.kind === "move" && moveTo) {
      move(pending.studentId, moveTo);
      toast(`${nameOf(pending.studentId)} moved to ${state.groups.find((g) => g.id === moveTo)?.name}.`);
    }
    setPending(null);
    setMoveTo("");
  };

  const open = groups.reduce((n, g) => n + openSeats(g), 0);
  const whereAmI = teacher
    ? `${seatedCount(state)} students seated · ${open} open seat${open === 1 ? "" : "s"}.`
    : mine
      ? `You’re at ${mine.name}.`
      : "You’re not at a table yet. Pick an open seat.";

  return (
    <>
      <ScreenHeader
        id="WF07"
        title="Round table"
        kicker={`${theClass.name.split(" – ")[0]} · Project ${currentProject.number} · ${currentProject.name}`}
        actions={
          groups.length > 0 && (
            <Button
              kind="dashed"
              className="rounded-[10px]"
              disabled={!teacher && started}
              onClick={() => {
                createGroup();
                toast(`Table ${state.groups.length + 1} created. Sit there to start it.`);
              }}
            >
              ＋ Create group
            </Button>
          )
        }
      />

      {groups.length === 0 ? (
        <div className="max-w-[560px]">
          <StateCard
            kind="empty"
            title="No tables yet"
            action={
              teacher ? (
                <LinkButton href="/admin/groups" kind="primary">Set up tables</LinkButton>
              ) : (
                <LinkButton href="/student">Back to dashboard</LinkButton>
              )
            }
          >
            {teacher
              ? "Set the number of tables and seats in Group setup."
              : `${nameOf(TEACHER_ID)} is still setting up groups. Tables will show up here when they’re ready — we’ll let you know.`}
          </StateCard>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {!started ? (
            <PhaseBanner tag="Open">
              Pick any open seat to join. You can join, leave, or switch until Project {currentProject.number} starts on {startsOn}.
            </PhaseBanner>
          ) : (
            <PhaseBanner tag="Locked" locked>
              Project {currentProject.number} started on {startsOn}. Group changes are closed.{" "}
              {teacher ? "Students can’t switch now. Use Move to fix a table." : "Ask your teacher to move you."}
            </PhaseBanner>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
            <span className="flex-[1_1_200px]">{whereAmI}</span>
            <StatusLegend />
          </div>

          <ul aria-label="Role key" className="flex flex-wrap gap-1.5">
            {activeRoles(state).map((r) => (
              <li key={r.id}>
                <RoleChip role={r} size="sm" />
              </li>
            ))}
          </ul>

          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-4">
            {groups.map((g) => {
              const status = groupStatus(g, started);
              const isMine = !teacher && mine?.id === g.id;
              const count = membersOf(g).length;
              const full = openSeats(g) === 0;
              const seatsOff = !studentCanChange || isMine;
              return (
                <li
                  key={g.id}
                  aria-label={g.name}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl bg-white p-[18px]",
                    isMine || fix === g.id
                      ? "border-2 border-ink"
                      : status === "not-full-started"
                        ? "border-[1.5px] border-[#e3a59b]"
                        : "border-[1.5px] border-ink",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold">{g.name}</h2>
                      <span className="text-sm text-muted">
                        {count} of {g.seats.length} seats
                      </span>
                    </div>
                    <GroupStatusLabel status={status} />
                  </div>

                  <RoundTable
                    size="lg"
                    label={isMine ? "Your table" : count === 0 ? "New" : ""}
                    tableName={g.name}
                    seats={g.seats}
                    youId={teacher ? undefined : ME_ID}
                    roleOf={(id) => roleFor(state, id, currentProject.id)}
                    nameOf={nameOf}
                    onSit={(i) => sit(g, i)}
                    sitDisabled={seatsOff}
                    sitLabel={started || teacher ? "Empty" : isMine ? "Open" : "Sit here"}
                  />

                  {teacher && count > 0 && (
                    <ul aria-label={`Move someone from ${g.name}`} className="flex flex-col gap-1 border-t-[1.5px] border-mint-line pt-2">
                      {membersOf(g).map((id) => (
                        <li key={id} className="flex items-center justify-between gap-2 text-sm">
                          <span>{nameOf(id)}</span>
                          <Button small kind="ghost" onClick={() => setPending({ kind: "move", studentId: id })} aria-label={`Move ${nameOf(id)}`}>
                            Move
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!teacher &&
                    (started ? (
                      <CardAction disabled>{isMine ? "Your table · locked" : "Locked"}</CardAction>
                    ) : isMine ? (
                      <CardAction
                        onClick={() => {
                          move(ME_ID, null);
                          toast(`You left ${g.name}. Your seat is open.`);
                        }}
                      >
                        Leave
                      </CardAction>
                    ) : full ? (
                      <CardAction disabled>Full</CardAction>
                    ) : (
                      <CardAction primary onClick={() => sit(g)}>
                        {mine ? "Switch" : "Join"}
                      </CardAction>
                    ))}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Modal
        open={pending?.kind === "switch"}
        onClose={() => setPending(null)}
        title={pending?.kind === "switch" ? `Switch to ${pending.to.name}?` : ""}
        actions={
          <>
            <Button onClick={() => setPending(null)}>Stay at {mine?.name}</Button>
            <Button kind="primary" onClick={confirm}>Switch table</Button>
          </>
        }
      >
        <p className="text-pretty">
          You’ll leave {mine?.name} and your seat there opens up for someone else. You can switch again until Project {currentProject.number} starts on {startsOn}.
        </p>
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
              <label key={g.id} className="flex min-h-11 items-center gap-2 rounded-xl border-[1.5px] border-mint-line px-3 py-2 has-checked:border-ink">
                <input type="radio" name="move-to" value={g.id} checked={moveTo === g.id} onChange={() => setMoveTo(g.id)} className="accent-primary" />
                {g.name} · {membersOf(g).length}/{g.seats.length}
              </label>
            ))}
        </fieldset>
        <p className="text-xs">Their role for this project stays the same.</p>
      </Modal>
    </>
  );
}

/** Phase banner from HF07: white tag + sentence. Mint when open, red when locked. */
function PhaseBanner({ tag, locked, children }: { tag: string; locked?: boolean; children: ReactNode }) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border px-4 py-3",
        locked ? "border-bad-line bg-bad-bg text-bad" : "border-mint-line bg-mint-2 text-ink",
      )}
    >
      <b className="rounded-md bg-white px-2 py-0.5 text-sm">{tag}</b>
      <span className="flex-[1_1_260px] text-pretty">{children}</span>
    </div>
  );
}

/** Full-width card button: ink = join/switch, white = leave, mint = disabled (full / locked). */
function CardAction({ primary, disabled, onClick, children }: { primary?: boolean; disabled?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "mt-auto h-[46px] rounded-xl border-[1.5px] font-bold",
        disabled
          ? "cursor-not-allowed border-mint-line bg-mint-2 text-muted-2"
          : primary
            ? "border-ink bg-ink text-white hover:bg-ink-2"
            : "border-[#9aa39f] bg-white text-ink hover:bg-mint-hover",
      )}
    >
      {children}
    </button>
  );
}
