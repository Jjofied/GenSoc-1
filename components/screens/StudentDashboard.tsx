"use client";

import { GroupStatusLabel } from "@/components/GroupStatusLabel";
import { PostLine } from "@/components/PostLine";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleChip } from "@/components/RoleChip";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ProgressBar } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { LinkButton } from "@/components/ui/Button";
import { StateCard } from "@/components/ui/StateCard";
import { useDemo } from "@/lib/demo-store";
import { dayLabel, shortDate, stampDate, timeLabel } from "@/lib/format";
import { EVENT_TYPE } from "@/lib/labels";
import { ME_ID, projects } from "@/lib/mock-data";
import {
  activeRoles, calendarEvents, currentProject, doneRoleIds, firstName, groupOf, groupStatus,
  membersOf, nameOf, previousProject, roleFor, upcoming,
} from "@/lib/selectors";
import type { CalendarEvent } from "@/lib/types";

function EventLine({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-14 flex-none rounded border-[1.5px] border-ink px-1 py-0.5 text-center font-mono text-[11px] font-bold">
        {stampDate(event.start)}
      </span>
      <span className="min-w-0 text-sm">
        <span aria-hidden>{EVENT_TYPE[event.type].glyph} </span>
        <span className="font-semibold">{event.title}</span>
        <span className="block text-xs text-muted">
          {timeLabel(event.start)}
          {event.location && ` · ${event.location}`}
        </span>
      </span>
    </div>
  );
}

/** WF03 · Student dashboard (canvas Option A · Cards). */
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

  return (
    <RoleGate allow="student" title="This is the student dashboard" message="Teachers have their own class overview." action={{ href: "/admin", label: "Go to class overview" }}>
      <PreviewBar current={{ state: preview }} groups={[{ param: "state", label: "State", options: [["", "Default"], ["empty", "Not in a group"]] }]} />
      <ScreenHeader
        id="WF03"
        title={`Hi, ${firstName(ME_ID)}`}
        sub={`Project ${currentProject.number} of ${projects.length} · ${currentProject.name} · demo ${dayLabel(currentProject.dueDate)}`}
      />

      {!group ? (
        <StateCard kind="empty" title="You’re not in a group yet" action={<LinkButton href="/groups" kind="primary">Find a table</LinkButton>}>
          Pick a seat at the round table.
        </StateCard>
      ) : (
        <BlockGrid>
          <Block span={4} strong label="My role this project" go={{ href: "/groups/role", label: "My role" }}>
            {role ? (
              <>
                <RoleChip role={role} size="lg" />
                <p className="text-sm text-ink-2">{role.focus}.</p>
                {lastRole && <p className="text-xs text-muted">Last project: {lastRole.name}</p>}
              </>
            ) : (
              <p className="text-sm text-muted">Your role shows here when the project starts.</p>
            )}
            <ProgressBar label="Roles done" value={done / total} note={`${done}/${total}`} />
          </Block>

          <Block span={4} label={`My group · ${group.name}`} go={{ href: "/groups", label: "Groups" }}>
            <GroupStatusLabel status={groupStatus(group, currentProject.status === "active")} />
            <ul className="flex flex-col gap-1.5">
              {membersOf(group).map((id) => {
                const r = roleFor(state, id, currentProject.id);
                return (
                  <li key={id} className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
                    <span className={id === ME_ID ? "font-bold" : undefined}>
                      {nameOf(id)}
                      {id === ME_ID && " (you)"}
                    </span>
                    {r && <RoleChip role={r} />}
                  </li>
                );
              })}
            </ul>
          </Block>

          <Block span={4} label="Next deadline" go={{ href: "/calendar", label: "Calendar" }}>
            {nextDeadline ? <EventLine event={nextDeadline} /> : <p className="text-sm text-muted">Nothing due.</p>}
            {thenDeadline && (
              <p className="text-xs text-muted">
                Then: {thenDeadline.title} · {shortDate(thenDeadline.start)}
              </p>
            )}
          </Block>

          <Block span={4} label="Next meeting" go={{ href: "/calendar", label: "Calendar" }}>
            {nextMeeting ? <EventLine event={nextMeeting} /> : <p className="text-sm text-muted">No meetings scheduled.</p>}
          </Block>

          <Block span={8} label="Latest posts · files & modules" go={{ href: "/posts", label: "Posts" }}>
            <ul className="flex flex-col gap-2">
              {latest.map((p) => (
                <li key={p.id}>
                  <PostLine post={p} />
                </li>
              ))}
            </ul>
          </Block>
        </BlockGrid>
      )}
    </RoleGate>
  );
}
