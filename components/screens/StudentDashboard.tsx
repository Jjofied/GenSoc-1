"use client";

import type { ReactNode } from "react";
import { GroupStatusLabel } from "@/components/GroupStatusLabel";
import { PostLine } from "@/components/PostLine";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleChip } from "@/components/RoleChip";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Avatar, DateTile, Kicker, ProgressBar } from "@/components/ui/Bits";
import { GoLink, LinkButton } from "@/components/ui/Button";
import { AppLink as Link } from "@/lib/app-mode";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { dayLabel, shortDate, timeLabel, toDate } from "@/lib/format";
import { EVENT_TYPE } from "@/lib/labels";
import { ME_ID, projects } from "@/lib/mock-data";
import {
  activeRoles, calendarEvents, currentProject, doneRoleIds, firstName, groupOf, groupStatus,
  membersOf, nameOf, previousProject, roleFor, theClass, TODAY, upcoming,
} from "@/lib/selectors";
import type { CalendarEvent } from "@/lib/types";

/** "Wednesday, October 21" for the prototype's today. */
const longDay = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(toDate(TODAY));

const TILE_KIND = { meeting: "meeting", deadline: "deadline", "project-start": "pending" } as const;

/** Dashboard card: white, ink outline, 4px hard shadow. Cells of an auto-fit grid. */
function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("flex min-w-0 flex-col gap-3 rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-md", className)}>{children}</section>;
}

const CARD_GRID = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-4";

/** Date tile + type kicker + title + when/where. */
function EventLine({ event, kicker = true }: { event: CalendarEvent; kicker?: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <DateTile date={event.start} kind={TILE_KIND[event.type]} />
      <span className="min-w-0">
        {kicker && <Kicker className="block tracking-[0.05em]">{EVENT_TYPE[event.type].label}</Kicker>}
        <b className="block">{event.title}</b>
        <span className="block text-[15px] text-muted">
          {dayLabel(event.start)} · {timeLabel(event.start)}
          {event.location && ` · ${event.location}`}
        </span>
      </span>
    </div>
  );
}

/** WF03 · Student dashboard (hi-fi Option A · Cards). */
export function StudentDashboard({ preview }: { preview: string }) {
  const { state } = useDemo();
  const group = preview === "empty" ? undefined : groupOf(state, ME_ID);
  const role = roleFor(state, ME_ID, currentProject.id);
  const lastRole = previousProject && roleFor(state, ME_ID, previousProject.id);
  const done = doneRoleIds(state, ME_ID).size;
  const total = activeRoles(state).length;
  const events = calendarEvents(state);
  const [nextDeadline, thenDeadline] = upcoming(events, "deadline");
  const nextMeeting = upcoming(events, "meeting")[0];
  const latest = [...state.posts].sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 3);
  const started = currentProject.status === "active";
  const teacher = nameOf(theClass.adminId);

  return (
    <RoleGate allow="student" title="This is the student dashboard" message="Teachers have their own class overview." action={{ href: "/admin", label: "Go to class overview" }}>
      <PreviewBar current={{ state: preview }} groups={[{ param: "state", label: "State", options: [["", "Default"], ["empty", "Not in a group"]] }]} />
      <ScreenHeader
        id="WF03"
        kicker={longDay}
        title={`Hi, ${firstName(ME_ID)}`}
        sub={
          group
            ? `Project ${currentProject.number} of ${projects.length} · ${currentProject.name} · demo ${dayLabel(currentProject.dueDate)}`
            : `${theClass.name} · Project ${currentProject.number} ${started ? "started" : "starts"} ${dayLabel(currentProject.startDate)}`
        }
      />

      {!group ? (
        <div className={CARD_GRID}>
          <Card className="items-start gap-4 px-6 py-7">
            <EmptyTable />
            <h2 className="text-2xl font-bold">You’re not in a group yet</h2>
            <p className="text-pretty text-ink-2">
              {started ? (
                <>
                  Project {currentProject.number} started on <b>{dayLabel(currentProject.startDate)}</b>, so tables are locked. Find a table with open seats and ask{" "}
                  {teacher} to move you in.
                </>
              ) : (
                <>
                  Join a table to meet your group. You can switch tables until Project {currentProject.number} starts on{" "}
                  <b>{dayLabel(currentProject.startDate)}</b>. After that, only {teacher} can move you.
                </>
              )}
            </p>
            <LinkButton href="/groups" kind="primary">Find a table</LinkButton>
          </Card>

          <Card>
            <h2 className="text-lg font-bold">Coming up</h2>
            {upcoming(events).length === 0 ? (
              <p className="text-[15px] text-muted">Nothing scheduled yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {upcoming(events).slice(0, 2).map((e) => (
                  <li key={e.id}>
                    <EventLine event={e} />
                  </li>
                ))}
              </ul>
            )}
            {state.posts.length === 0 ? (
              <p className="text-[15px] text-muted">No posts yet. Files and meetings from {teacher} will show up here.</p>
            ) : (
              <GoLink href="/posts" className="self-start py-2.5">All posts</GoLink>
            )}
          </Card>
        </div>
      ) : (
        <div className={CARD_GRID}>
          <Card className="gap-3.5">
            <h2 className="text-[15px] font-bold uppercase tracking-[0.06em] text-muted">My role this project</h2>
            {role ? (
              <>
                <RoleChip role={role} size="lg" />
                <p className="text-pretty">{role.focus}.</p>
              </>
            ) : (
              <p className="text-muted">Your role shows here when the project starts.</p>
            )}
            {lastRole && (
              <div className="flex flex-wrap items-center gap-2 text-[15px] text-muted">
                Last project: <RoleChip role={lastRole} size="sm" />
              </div>
            )}
            <ProgressBar label="Roles you’ve done" value={done / total} note={`${done} of ${total}`} />
            <LinkButton href="/groups/role" className="self-start">Role details</LinkButton>
          </Card>

          <Card>
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">My group · {group.name}</h2>
              <GroupStatusLabel status={groupStatus(group, started)} suffix={`${membersOf(group).length} of ${group.seats.length}`} />
            </header>
            <ul className="flex flex-col">
              {membersOf(group).map((id) => {
                const r = roleFor(state, id, currentProject.id);
                const you = id === ME_ID;
                return (
                  <li key={id} className="flex flex-wrap items-center gap-2.5 border-b border-mint-hover py-[7px] last:border-b-0">
                    <Avatar name={nameOf(id)} you={you} />
                    <span className="min-w-0 flex-1">
                      {nameOf(id)}
                      {you && <b> (you)</b>}
                    </span>
                    {r && <RoleChip role={r} size="sm" />}
                  </li>
                );
              })}
            </ul>
            <GoLink href="/groups" className="self-start py-2.5">See all tables</GoLink>
          </Card>

          <Card>
            <h2 className="text-xl font-bold">Next deadline</h2>
            {nextDeadline ? <EventLine event={nextDeadline} /> : <p className="text-muted">Nothing due.</p>}
            {thenDeadline && (
              <p className="text-[15px] text-muted">
                Then: {thenDeadline.title} · {shortDate(thenDeadline.start)}
              </p>
            )}
            <GoLink href="/calendar" className="self-start py-2.5">Open calendar</GoLink>
          </Card>

          <Card>
            <h2 className="text-xl font-bold">Next meeting</h2>
            {nextMeeting ? <EventLine event={nextMeeting} /> : <p className="text-muted">No meetings scheduled.</p>}
            <GoLink href="/calendar" className="self-start py-2.5">Open calendar</GoLink>
          </Card>

          <Card className="gap-1">
            <h2 className="mb-2 text-xl font-bold">Latest posts · files &amp; modules</h2>
            {latest.length === 0 ? (
              <p className="text-muted">No posts yet.</p>
            ) : (
              <ul className="flex flex-col">
                {latest.map((p) => (
                  <li key={p.id} className="border-b border-mint-hover last:border-b-0">
                    <Link href="/posts" className="flex min-h-11 py-2.5 hover:bg-mint">
                      <PostLine post={p} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <GoLink href="/posts" className="self-start py-2.5">All posts</GoLink>
          </Card>
        </div>
      )}
    </RoleGate>
  );
}

/** Dashed round table with six empty seats: "no group yet". Decorative. */
function EmptyTable() {
  return (
    <div aria-hidden className="relative h-[150px] w-[150px] self-center">
      <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-muted-line" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = ((-90 + 60 * i) * Math.PI) / 180;
        return (
          <span
            key={i}
            className="absolute h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-muted-line"
            style={{ left: `${(50 + 40 * Math.cos(a)).toFixed(2)}%`, top: `${(50 + 40 * Math.sin(a)).toFixed(2)}%` }}
          />
        );
      })}
    </div>
  );
}
