"use client";

import { useState } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { KeyValue, Kicker } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { StateCard } from "@/components/ui/StateCard";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { downloadIcs } from "@/lib/download";
import { isoDay, monthLabel, shortDate, timeLabel, toDate, whenLabel } from "@/lib/format";
import { EVENT_TYPE } from "@/lib/labels";
import { calendarEvents, TODAY, upcoming } from "@/lib/selectors";
import type { CalendarEvent } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const addDays = (iso: string, n: number) => isoDay(new Date(toDate(iso).getTime() + n * 86_400_000));
const startOfWeek = (iso: string) => addDays(iso, -toDate(iso).getUTCDay());

function monthDays(cursor: string): string[] {
  const first = `${cursor.slice(0, 7)}-01`;
  const start = startOfWeek(first);
  const d = toDate(first);
  const last = isoDay(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
  const days: string[] = [];
  for (let day = start; day <= last || toDate(day).getUTCDay() !== 0; day = addDays(day, 1)) days.push(day);
  return days;
}

function shiftMonth(cursor: string, n: number) {
  const d = toDate(cursor);
  return isoDay(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)));
}

function EventPill({ event, selected, onSelect, compact }: { event: CalendarEvent; selected: boolean; onSelect: () => void; compact?: boolean }) {
  const t = EVENT_TYPE[event.type];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={event.title}
      className={cn(
        "flex w-full min-w-0 items-center gap-1 rounded border-[1.2px] px-1 py-0.5 text-left text-[11px]",
        event.type === "deadline" ? "border-ink bg-fill" : event.type === "project-start" ? "border-dashed border-ink bg-white" : "border-line bg-white",
        selected && "outline-2 outline-offset-1 outline-ink",
      )}
    >
      <span aria-hidden className="flex-none">{t.glyph}</span>
      <span className="sr-only">{t.label}: </span>
      <span className={cn("truncate", compact && "hidden lg:inline")}>{event.title}</span>
      {compact && <span className="sr-only lg:hidden">{event.title}</span>}
    </button>
  );
}

/** WF09 · Calendar. Teachers add events (through Posts); students view and export. */
export function CalendarScreen({ preview }: { preview: string }) {
  const { state, deletePost, toast } = useDemo();
  const teacher = state.viewAs === "admin";
  const all = preview === "empty" ? [] : calendarEvents(state);
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(TODAY);
  const [selectedId, setSelectedId] = useState(() => upcoming(calendarEvents(state))[0]?.id ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (preview === "denied" && !teacher)
    return (
      <>
        <Preview preview={preview} />
        <ScreenHeader id="WF09" title="Calendar" />
        <StateCard kind="denied" title="Only teachers add events" action={<LinkButton href="/calendar" kind="primary">Back to calendar</LinkButton>}>
          You can view and export.
        </StateCard>
      </>
    );

  const selected = all.find((e) => e.id === selectedId);
  const byDay = (day: string) => all.filter((e) => e.start.slice(0, 10) === day);
  const month = cursor.slice(0, 7);
  const monthEvents = all.filter((e) => e.start.startsWith(month));
  const weekStart = startOfWeek(cursor);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const sub = view === "month" ? monthLabel(cursor) : `${shortDate(week[0])} – ${shortDate(week[6])}`;
  const step = (n: number) => setCursor(view === "month" ? shiftMonth(cursor, n) : addDays(cursor, n * 7));

  return (
    <>
      <Preview preview={preview} />
      <ScreenHeader
        id="WF09"
        title="Calendar"
        sub={sub}
        actions={teacher && <LinkButton href="/posts?compose=meeting" kind="primary" small>＋ Add event</LinkButton>}
      />
      <BlockGrid>
        <Block span={8}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Segmented label="Calendar view" options={[["month", "Month"], ["week", "Week"]] as const} value={view} onChange={setView} />
            <div className="flex items-center gap-1">
              <Button small kind="ghost" onClick={() => step(-1)} aria-label={view === "month" ? "Previous month" : "Previous week"}>←</Button>
              <Button small onClick={() => setCursor(TODAY)}>Today</Button>
              <Button small kind="ghost" onClick={() => step(1)} aria-label={view === "month" ? "Next month" : "Next week"}>→</Button>
            </div>
          </div>

          {view === "month" && monthEvents.length === 0 ? (
            <StateCard kind="empty" title="Quiet month" action={teacher && <LinkButton href="/posts?compose=meeting" kind="primary">＋ Add first event</LinkButton>}>
              Nothing scheduled in {monthLabel(cursor).split(" ")[0]}.
            </StateCard>
          ) : view === "month" ? (
            <>
              <div className="grid grid-cols-7 overflow-hidden rounded-md border-[1.5px] border-ink">
                <div aria-hidden className="contents">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="border-b-[1.5px] border-ink bg-fill-soft py-1 text-center font-mono text-[10px] font-bold uppercase">
                      {d}
                    </div>
                  ))}
                </div>
                {monthDays(cursor).map((day) => {
                  const inMonth = day.startsWith(month);
                  return (
                    <div
                      key={day}
                      className={cn("flex min-h-16 min-w-0 flex-col gap-0.5 border-b border-r border-line-soft p-1 lg:min-h-20", !inMonth && "bg-paper text-muted")}
                    >
                      <span className={cn("self-start font-mono text-[11px] font-semibold", day === TODAY && "rounded bg-ink px-1 text-white")}>
                        <span aria-hidden>{toDate(day).getUTCDate()}</span>
                        <span className="sr-only">
                          {shortDate(day)}
                          {day === TODAY && " (today)"}
                        </span>
                      </span>
                      {byDay(day).map((e) => (
                        <EventPill key={e.id} event={e} selected={e.id === selectedId} onSelect={() => setSelectedId(e.id)} compact />
                      ))}
                    </div>
                  );
                })}
              </div>
              <ul className="flex flex-col gap-1.5 lg:hidden" aria-label="Events this month">
                {monthEvents.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 text-sm">
                    <span className="w-12 flex-none font-mono text-[11px] font-bold">{shortDate(e.start)}</span>
                    <EventPill event={e} selected={e.id === selectedId} onSelect={() => setSelectedId(e.id)} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-7">
              {week.map((day) => (
                <li key={day} className={cn("flex min-h-28 flex-col gap-1 rounded-md border-[1.5px] p-1.5", day === TODAY ? "border-ink" : "border-line-soft")}>
                  <span className="font-mono text-[11px] font-bold uppercase">
                    {WEEKDAYS[toDate(day).getUTCDay()]} {toDate(day).getUTCDate()}
                    {day === TODAY && " · today"}
                  </span>
                  {byDay(day).map((e) => (
                    <div key={e.id} className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted">{timeLabel(e.start)}</span>
                      <EventPill event={e} selected={e.id === selectedId} onSelect={() => setSelectedId(e.id)} />
                    </div>
                  ))}
                </li>
              ))}
            </ol>
          )}

          <p className="text-xs text-muted">
            Key: □ Meeting · ■ Deadline · ▷ Project start (rotation day). Color comes in mid-fi.
          </p>
        </Block>

        <Block span={4} label="Event detail">
          {!selected ? (
            <p className="text-sm text-muted">Pick an event to see the details.</p>
          ) : (
            <>
              <Kicker>
                {EVENT_TYPE[selected.type].glyph} {EVENT_TYPE[selected.type].label}
                {!teacher && " · view only"}
              </Kicker>
              <p className="text-lg font-bold">{selected.title}</p>
              <KeyValue
                items={[
                  ["When", whenLabel(selected.start)],
                  ["Room / link", selected.location ?? "—"],
                  ["Files", selected.attachment ? `▤ ${selected.attachment.name}` : "—"],
                ]}
              />
              {teacher ? (
                selected.postId ? (
                  <div className="flex flex-wrap gap-2">
                    <LinkButton href="/posts" small>Edit in Posts</LinkButton>
                    <Button small onClick={() => setConfirmDelete(true)}>Delete</Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted">Project starts come from the project plan, so they can’t be deleted here.</p>
                )
              ) : (
                <Button onClick={() => downloadIcs(selected)} className="self-start">Add to my calendar (.ics)</Button>
              )}
            </>
          )}
        </Block>
      </BlockGrid>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete “${selected?.title}”?`}
        actions={
          <>
            <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              kind="primary"
              onClick={() => {
                if (selected?.postId) deletePost(selected.postId);
                setConfirmDelete(false);
                setSelectedId("");
                toast("Event deleted. It’s gone from Posts too.");
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>It’s removed from the calendar and from Posts for everyone in the class.</p>
      </Modal>
    </>
  );
}

function Preview({ preview }: { preview: string }) {
  return (
    <PreviewBar
      current={{ state: preview }}
      groups={[{ param: "state", label: "State", options: [["", "Default"], ["empty", "Quiet month"], ["denied", "Student opens add-event link"]] }]}
    />
  );
}
