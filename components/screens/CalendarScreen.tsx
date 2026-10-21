"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { StateCard } from "@/components/ui/StateCard";
import { AppLink as Link } from "@/lib/app-mode";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { downloadIcs, downloadSampleFile } from "@/lib/download";
import { dayLabel, isoDay, monthLabel, shortDate, timeLabel, TODAY_TIME, toDate } from "@/lib/format";
import { EVENT_TYPE, type TypeTone } from "@/lib/labels";
import { TEACHER_ID } from "@/lib/mock-data";
import { calendarEvents, nameOf, theClass, TODAY, upcoming } from "@/lib/selectors";
import type { CalendarEvent, Post } from "@/lib/types";

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

const tone = (t: TypeTone): CSSProperties => ({ background: t.bg, color: t.fg, border: t.border });
const typeLabel = (e: CalendarEvent) => (e.type === "project-start" ? "Project start · rotation day" : EVENT_TYPE[e.type].label);
const eventTime = (e: CalendarEvent) => (e.type === "project-start" ? "All day" : timeLabel(e.start));
const ariaFor = (e: CalendarEvent) => `${typeLabel(e)}: ${e.title}, ${dayLabel(e.start)}`;

/** Selected event keeps a grey ring; focus still gets the global ink outline. */
const ring = (on: boolean) => on && "outline-3 outline-offset-1 outline-muted-line";

/** Desktop month cell pill: glyph + title in the event type's colors. */
function EventPill({ event, selected, onSelect }: { event: CalendarEvent; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={ariaFor(event)}
      title={event.title}
      style={tone(EVENT_TYPE[event.type])}
      className={cn(
        "flex min-h-[26px] w-full min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap rounded-md px-1.5 py-0.5 text-left text-xs font-bold",
        ring(selected),
      )}
    >
      <span aria-hidden className="flex-none">{EVENT_TYPE[event.type].glyph}</span>
      <span className="truncate">{event.title}</span>
    </button>
  );
}

/** Month / Week: mint track, selected option white (hi-fi calendar toggle). */
function ViewToggle({ value, onChange }: { value: "month" | "week"; onChange: (v: "month" | "week") => void }) {
  return (
    <div role="group" aria-label="View" className="flex gap-[3px] rounded-[10px] bg-mint-2 p-[3px]">
      {(["month", "week"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn("h-[38px] rounded-lg px-3.5 font-bold capitalize text-ink", value === v ? "bg-white" : "hover:bg-mint-hover")}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

const navBtn = "press grid h-11 w-11 place-items-center rounded-[10px] border-[1.5px] border-ink bg-white text-lg shadow-hard-sm hover:shadow-none";

/** Teacher's add / edit form. Events live as meeting or deadline posts, so saving also updates Posts. */
function EventForm({ editing, onSaved, onCancel }: { editing?: Post; onSaved: (eventId: string, day: string) => void; onCancel: () => void }) {
  const { addPost, deletePost, toast } = useDemo();
  const typeId = useId();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [type, setType] = useState<"meeting" | "deadline">(editing?.type === "deadline" ? "deadline" : "meeting");
  const [date, setDate] = useState(editing?.dateTime?.slice(0, 10) ?? TODAY);
  const [time, setTime] = useState(editing?.dateTime?.slice(11, 16) ?? "14:00");
  const [location, setLocation] = useState(editing?.location ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Add a title.";
    if (!date) errs.date = "Pick a date.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const dateTime = `${date}T${time || (type === "deadline" ? "23:59" : "09:00")}`;
    const base = editing ?? { id: `post-${Date.now()}`, classId: theClass.id, body: "", postedAt: TODAY_TIME };
    const post: Post = { ...base, type, title: title.trim(), dateTime };
    if (location.trim()) post.location = location.trim();
    else delete post.location;
    // No update action in the store: replace the post in place (same id, same posted time).
    if (editing) deletePost(editing.id);
    addPost(post);
    toast(editing ? "Event updated. Posts show the change too." : `Added to calendar and Posts · ${shortDate(dateTime)}`);
    onSaved(`ev-${post.id}`, date);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-lg">
      <h2 className="text-xl font-bold">{editing ? "Edit event" : "New event"}</h2>
      <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. Code review" autoFocus />
      <div className="flex flex-col gap-1">
        <label htmlFor={typeId} className="text-[13px] font-bold text-ink-2">Type</label>
        <select
          id={typeId}
          value={type}
          onChange={(e) => setType(e.target.value as "meeting" | "deadline")}
          className="min-h-12 rounded-xl border-[1.5px] border-ink bg-white px-3 text-base shadow-hard-sm"
        >
          <option value="meeting">Meeting</option>
          <option value="deadline">Deadline</option>
        </select>
        <p className="text-sm text-muted">Project starts come from the project plan.</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
        <Field label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <Field label="Room or link" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 304 · meet link" />
      <p className="flex items-center gap-2 text-sm text-ok">
        <b aria-hidden>▦</b> Also shared in Posts, so students see it right away.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button kind="primary" type="submit">Save event</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

/** WF09 · Calendar. Teachers add, edit and delete events; students view and export (.ics). */
export function CalendarScreen({ preview }: { preview: string }) {
  const { state, deletePost, toast } = useDemo();
  const teacher = state.viewAs === "admin";
  const all = preview === "empty" ? [] : calendarEvents(state);
  const [view, setView] = useState<"month" | "week">(preview === "week" ? "week" : "month");
  const [cursor, setCursor] = useState(TODAY);
  const [selectedId, setSelectedId] = useState(() => upcoming(calendarEvents(state))[0]?.id ?? "");
  const [form, setForm] = useState<{ editing?: Post } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (preview === "denied" && !teacher)
    return (
      <>
        <Preview preview={preview} />
        <ScreenHeader id="WF09" title="Calendar" />
        <StateCard kind="denied" title="Only teachers add events" action={<LinkButton href="/calendar" kind="primary">Back to calendar</LinkButton>}>
          You can view every event and add it to your own calendar (.ics).
        </StateCard>
      </>
    );

  const selected = all.find((e) => e.id === selectedId);
  const selectedPost = selected?.postId ? state.posts.find((p) => p.id === selected.postId) : undefined;
  const byDay = (day: string) => all.filter((e) => e.start.slice(0, 10) === day);
  const month = cursor.slice(0, 7);
  const weekStart = startOfWeek(cursor);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const inRange = all.filter((e) => (view === "month" ? e.start.startsWith(month) : e.start.slice(0, 10) >= week[0] && e.start.slice(0, 10) <= week[6]));
  const showsToday = view === "month" ? TODAY.startsWith(month) : TODAY >= week[0] && TODAY <= week[6];

  const range = view === "month" ? monthLabel(cursor) : `${shortDate(week[0])} – ${shortDate(week[6])}`;
  const step = (n: number) => setCursor(view === "month" ? shiftMonth(cursor, n) : addDays(cursor, n * 7));
  const select = (id: string) => {
    setSelectedId(id);
    setForm(null);
  };
  const teacherName = nameOf(TEACHER_ID);
  const monthName = monthLabel(cursor).split(" ")[0];

  return (
    <>
      <Preview preview={preview} />
      <ScreenHeader
        id="WF09"
        title="Calendar"
        actions={
          <>
            <div className="flex items-center gap-1">
              <button type="button" className={navBtn} onClick={() => step(-1)} aria-label={view === "month" ? "Previous month" : "Previous week"}>‹</button>
              <b aria-live="polite" className="min-w-[120px] text-center">{range}</b>
              <button type="button" className={navBtn} onClick={() => step(1)} aria-label={view === "month" ? "Next month" : "Next week"}>›</button>
            </div>
            {!showsToday && <Button small kind="ghost" onClick={() => setCursor(TODAY)}>Today</Button>}
            <ViewToggle value={view} onChange={setView} />
            {teacher ? (
              <Button kind="primary" onClick={() => setForm({})}>＋ Add event</Button>
            ) : (
              <span className="inline-flex h-9 items-center rounded-full border-[1.5px] border-ink bg-white px-3 text-sm font-bold text-muted">View only</span>
            )}
          </>
        }
      />

      <ul aria-label="Key" className="mb-3.5 flex flex-wrap gap-3 text-sm">
        {(["meeting", "deadline", "project-start"] as const).map((k) => (
          <li key={k} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-4 w-4 rounded-[4px]" style={tone(EVENT_TYPE[k])} />
            {EVENT_TYPE[k].glyph} {EVENT_TYPE[k].label}
            {k === "project-start" && " (rotation day)"}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-start gap-4">
        <section aria-label={`${range} calendar`} className="relative min-w-0 flex-[3_1_520px] overflow-hidden rounded-2xl border-[1.5px] border-ink bg-white shadow-hard-md">
          {view === "month" ? (
            <>
              <div aria-hidden className="grid grid-cols-7 border-b-[1.5px] border-ink bg-mint">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="px-1.5 py-2 text-center text-[13px] font-bold text-muted">
                    <span className="md:hidden">{d[0]}</span>
                    <span className="hidden md:inline">{d}</span>
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays(cursor).map((day) => {
                  const inMonth = day.startsWith(month);
                  const evs = inMonth ? byDay(day) : [];
                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex min-h-[52px] min-w-0 flex-col gap-[3px] border-b border-r border-mint-hover p-[5px] md:min-h-24",
                        inMonth ? "bg-white" : "bg-mint",
                      )}
                    >
                      {inMonth && (
                        <span
                          className={cn(
                            "grid h-6 min-w-6 place-items-center self-start rounded-full px-1 text-[13px]",
                            day === TODAY ? "bg-ink font-bold text-white" : "text-ink",
                          )}
                        >
                          <span aria-hidden>{toDate(day).getUTCDate()}</span>
                          <span className="sr-only">
                            {shortDate(day)}
                            {day === TODAY && " (today)"}
                          </span>
                        </span>
                      )}
                      {evs.length > 0 && (
                        <>
                          <div className="hidden flex-col gap-[3px] md:flex">
                            {evs.map((e) => (
                              <EventPill key={e.id} event={e} selected={e.id === selectedId} onSelect={() => select(e.id)} />
                            ))}
                          </div>
                          {/* Mobile: dots only; the agenda list below is the way in. */}
                          <span className="flex flex-wrap gap-[3px] md:hidden">
                            {evs.map((e) => (
                              <span key={e.id} aria-hidden className="h-2.5 w-2.5 rounded-[3px]" style={tone(EVENT_TYPE[e.type])} />
                            ))}
                            <span className="sr-only">{evs.map(ariaFor).join("; ")}</span>
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,110px),1fr))]">
              {week.map((day) => {
                const evs = byDay(day);
                return (
                  <li
                    key={day}
                    className={cn("flex flex-col gap-1.5 border-b border-r border-mint-hover p-2.5 md:min-h-[360px]", day === TODAY ? "bg-mint" : "bg-white")}
                  >
                    <b className="text-sm">
                      {WEEKDAYS[toDate(day).getUTCDay()]} {toDate(day).getUTCDate()}
                      {day === TODAY && " · Today"}
                    </b>
                    {evs.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => select(e.id)}
                        aria-pressed={e.id === selectedId}
                        aria-label={`${ariaFor(e)}, ${eventTime(e)}`}
                        style={tone(EVENT_TYPE[e.type])}
                        className={cn("flex flex-col items-start gap-0.5 rounded-lg p-2 text-left text-[13px]", ring(e.id === selectedId))}
                      >
                        <b>
                          <span aria-hidden>{EVENT_TYPE[e.type].glyph}</span> {e.title}
                        </b>
                        <span>{eventTime(e)}</span>
                      </button>
                    ))}
                    {evs.length === 0 && <span className="text-[13px] text-muted-line">—</span>}
                  </li>
                );
              })}
            </ol>
          )}

          {inRange.length === 0 && (
            <div className="absolute inset-0 grid place-items-center bg-white/75 p-4">
              <div className="flex max-w-[340px] flex-col items-center gap-2.5 rounded-[14px] border-[1.5px] border-ink bg-white p-5 text-center shadow-hard-md">
                <b className="text-xl">{view === "month" ? "Quiet month" : "Quiet week"}</b>
                <span className="text-muted">
                  Nothing scheduled {view === "month" ? `in ${monthName}` : "this week"}.{" "}
                  {teacher ? "Add a meeting or deadline — students see it right away." : `Check back after ${teacherName} posts.`}
                </span>
                {teacher && <Button kind="primary" onClick={() => setForm({})}>＋ Add first event</Button>}
              </div>
            </div>
          )}
        </section>

        <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-3">
          {teacher && form && (
            <EventForm
              key={form.editing?.id ?? "new"}
              editing={form.editing}
              onCancel={() => setForm(null)}
              onSaved={(id, day) => {
                setForm(null);
                setSelectedId(id);
                setCursor(day);
              }}
            />
          )}

          {!form && selected && (
            <section aria-live="polite" aria-label="Event detail" className="flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-md">
              <span className="inline-flex items-center gap-1.5 self-start rounded-md px-2.5 py-[3px] text-[13px] font-bold" style={tone(EVENT_TYPE[selected.type])}>
                <span aria-hidden>{EVENT_TYPE[selected.type].glyph}</span> {typeLabel(selected)}
              </span>
              <h2 className="text-[22px] font-bold leading-tight">{selected.title}</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-[15px]">
                <dt className="text-muted">When</dt>
                <dd>
                  <b>{dayLabel(selected.start)}</b> · {eventTime(selected)}
                </dd>
                <dt className="text-muted">Room / link</dt>
                <dd className="min-w-0 break-words">{selected.location ?? "—"}</dd>
                <dt className="text-muted">Files</dt>
                <dd className="min-w-0">
                  {selected.attachment ? (
                    <button
                      type="button"
                      onClick={() => downloadSampleFile(selected.attachment!.name)}
                      className="break-all text-left underline underline-offset-4 hover:text-muted"
                      aria-label={`Download ${selected.attachment.name}`}
                    >
                      ▤ {selected.attachment.name}
                    </button>
                  ) : (
                    "None attached"
                  )}
                </dd>
                <dt className="text-muted">From</dt>
                <dd>
                  {selected.postId ? (
                    <>
                      {teacherName} ·{" "}
                      <Link href="/posts" className="underline underline-offset-4 hover:text-muted">see post</Link>
                    </>
                  ) : (
                    "Project plan"
                  )}
                </dd>
              </dl>
              {teacher ? (
                selectedPost ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Button onClick={() => setForm({ editing: selectedPost })}>Edit</Button>
                    <Button className="border-bad-line text-bad shadow-none hover:bg-bad-bg" onClick={() => setConfirmDelete(true)}>Delete</Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted">Project starts come from the project plan, so they can’t be changed here.</p>
                )
              ) : (
                <>
                  <Button onClick={() => downloadIcs(selected)} className="self-start">Add to my calendar (.ics)</Button>
                  <span className="text-sm text-muted">Only teachers can add or change events.</span>
                </>
              )}
            </section>
          )}

          {!form && inRange.length > 0 && (
            <section
              aria-label={view === "month" ? "This month" : "This week"}
              className={cn("flex flex-col gap-1 rounded-2xl border-[1.5px] border-ink bg-white px-5 py-4 shadow-hard-md", selected && "md:hidden")}
            >
              <h2 className="mb-1.5 text-lg font-bold">{view === "month" ? "This month" : "This week"}</h2>
              <ul>
                {inRange.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => select(e.id)}
                      aria-pressed={e.id === selectedId}
                      className="flex min-h-12 w-full items-center gap-3 border-b border-mint-hover py-1 text-left"
                    >
                      <span aria-hidden className="grid h-11 w-11 flex-none place-items-center rounded-lg font-bold" style={tone(EVENT_TYPE[e.type])}>
                        {toDate(e.start).getUTCDate()}
                      </span>
                      <span className="min-w-0">
                        <b>{e.title}</b>
                        <br />
                        <span className="text-sm text-muted">
                          {shortDate(e.start)} · {typeLabel(e)} · {eventTime(e)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

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
      groups={[
        {
          param: "state",
          label: "State",
          options: [["", "Default"], ["week", "Week view"], ["empty", "Quiet month"], ["denied", "Student opens add-event link"]],
        },
      ]}
    />
  );
}
