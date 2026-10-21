"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { GroupStatusLabel } from "@/components/GroupStatusLabel";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleIcon } from "@/components/RoleChip";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { Timeline } from "@/components/ui/Bits";
import { Button, GoLink, LinkButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AppLink as Link } from "@/lib/app-mode";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { dayLabel, shortDate } from "@/lib/format";
import { projects } from "@/lib/mock-data";
import {
  currentProject, groupStatus, membersOf, nameOf, nextProject, overrideCount, repeatCount,
  roleBalance, theClass, totalSeats,
} from "@/lib/selectors";

/** Dashboard card: white, ink outline, 4px hard shadow. */
function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("flex min-w-0 flex-col gap-3 rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-md", className)}>{children}</section>;
}

// Header quick actions: 10px-radius buttons, the first one ink-filled.
const ACTION = "press inline-flex min-h-11 items-center rounded-[10px] border-[1.5px] px-3.5 font-bold";
const ACTION_KIND = {
  main: "border-ink bg-ink text-white hover:bg-ink-2",
  plain: "border-[#9aa39f] bg-white text-ink hover:bg-mint",
};

const STEPS = [
  ["Create a class", "Name, section, and term. You’ll get an invite code."],
  ["Set up tables and roles", "Choose how many groups, seats, and which roles to use."],
  ["Share the code", "Students join and sit at a table."],
];

/** WF04 · Teacher class overview (hi-fi Option A · Alerts first). */
export function AdminDashboard({ preview }: { preview: string }) {
  const { state, toast } = useDemo();
  const [confirmStart, setConfirmStart] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const started = currentProject.status === "active";
  const withStatus = state.groups.map((g) => ({ g, status: groupStatus(g, started) }));
  const alerts = withStatus.filter((x) => x.status === "not-full-started" && !dismissed.includes(x.g.id));
  const students = theClass.studentIds.length;
  const next = nextProject;
  const repeats = repeatCount(state);
  const previewBar = <PreviewBar current={{ state: preview }} groups={[{ param: "state", label: "State", options: [["", "Default"], ["empty", "No class yet"]] }]} />;

  if (preview === "empty") {
    return (
      <RoleGate allow="admin" title="Only teachers see the class overview" message="Your dashboard has your role, your group and what’s due." action={{ href: "/student", label: "Go to my dashboard" }}>
        {previewBar}
        <div className="flex max-w-[640px] flex-col">
          <ScreenHeader id="WF04" kicker={`Welcome, ${nameOf(theClass.adminId)}`} title="You don’t have a class yet" />
          <ol className="flex flex-col gap-3">
            {STEPS.map(([title, sub], i) => (
              <li key={title} className={cn("flex items-start gap-3.5 rounded-[14px] border-[1.5px] border-ink bg-white p-4", i === 0 ? "shadow-hard-lg" : "shadow-hard-md")}>
                <span aria-hidden className={cn("grid h-8 w-8 flex-none place-items-center rounded-full font-bold", i === 0 ? "bg-ink text-white" : "bg-mint-2")}>
                  {i + 1}
                </span>
                <span>
                  <b>{title}</b>
                  <span className="block text-muted">{sub}</span>
                </span>
              </li>
            ))}
          </ol>
          <LinkButton href="/admin/classes/new" kind="primary" className="mt-5 min-h-[52px] self-start px-6 text-[17px]">Create a class</LinkButton>
        </div>
      </RoleGate>
    );
  }

  return (
    <RoleGate allow="admin" title="Only teachers see the class overview" message="Your dashboard has your role, your group and what’s due." action={{ href: "/student", label: "Go to my dashboard" }}>
      {previewBar}
      <ScreenHeader
        id="WF04"
        kicker={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {theClass.name} · {students} of {totalSeats(state)} students joined
            <LinkButton href="/admin/classes/new" small>＋ Create class</LinkButton>
          </span>
        }
        title="Class overview"
        sub={
          <>
            Project {currentProject.number} of {projects.length} · <b>{currentProject.name}</b> · {started ? "started" : "starts"} {dayLabel(currentProject.startDate)}
          </>
        }
        actions={
          <div role="group" aria-label="Quick actions" className="flex flex-wrap gap-2">
            <Link href="/posts?compose=file" className={cn(ACTION, ACTION_KIND.main)}>＋ Post file</Link>
            <Link href="/posts?compose=meeting" className={cn(ACTION, ACTION_KIND.plain)}>＋ Schedule meeting</Link>
            <Link href="/posts?compose=deadline" className={cn(ACTION, ACTION_KIND.plain)}>＋ Add deadline</Link>
            <button type="button" onClick={() => setConfirmStart(true)} className={cn(ACTION, ACTION_KIND.plain)}>＋ Start new project</button>
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        {alerts.length > 0 && (
          <section aria-label="Needs attention" className="flex flex-col gap-2">
            {alerts.map(({ g }) => (
              <Banner
                key={g.id}
                kind="alert"
                action={
                  <div className="flex gap-2">
                    <Link href={`/groups?fix=${g.id}`} className="inline-flex min-h-11 items-center rounded-[10px] bg-bad px-3.5 font-bold text-white hover:bg-bad/90">
                      Fix group
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDismissed((d) => [...d, g.id])}
                      className="inline-flex min-h-11 items-center rounded-[10px] border-[1.5px] border-[#e3a59b] bg-white px-3.5 font-bold text-bad"
                    >
                      Dismiss
                    </button>
                  </div>
                }
              >
                <b>
                  {g.name} isn’t full — {membersOf(g).length} of {g.seats.length} seats.
                </b>{" "}
                Project {currentProject.number} has started, so only you can move students in.
              </Banner>
            ))}
          </section>
        )}

        <Card className="gap-3.5">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">Tables</h2>
            <GoLink href="/groups">Open round table</GoLink>
          </header>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5">
            {withStatus.map(({ g, status }) => {
              const count = membersOf(g).length;
              return (
                <li key={g.id}>
                  <Link
                    href={`/groups?fix=${g.id}`}
                    className={cn(
                      "flex flex-col gap-2 rounded-xl border-[1.5px] bg-white p-3.5 hover:bg-mint",
                      status === "not-full-started" ? "border-[#e3a59b]" : "border-mint-line",
                    )}
                  >
                    <span className="flex items-baseline justify-between">
                      <b className="text-[17px]">{g.name}</b>
                      <span className="text-[15px] font-bold">
                        {count} / {g.seats.length}
                        <span className="sr-only"> seats taken</span>
                      </span>
                    </span>
                    <span aria-hidden className="flex gap-1">
                      {g.seats.map((s) => (
                        <span key={s.index} className={cn("h-3.5 w-3.5 rounded-full", s.studentId ? "bg-ink" : "border-[1.5px] border-dashed border-muted-line bg-white")} />
                      ))}
                    </span>
                    <span className="self-start">
                      <GroupStatusLabel status={status} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-4">
          <Card>
            <h2 className="text-xl font-bold">Rotation status</h2>
            <div className="flex items-center gap-3 rounded-xl bg-ok-bg p-3 text-ok">
              <span aria-hidden className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white font-bold">✓</span>
              <span>
                <b>Roles rotated for Project {currentProject.number}</b> on {dayLabel(currentProject.startDate)}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                ["Same role two projects in a row", `${repeats} student${repeats === 1 ? "" : "s"}`],
                ["Teacher overrides", overrideCount(state)],
                ["Next rotation", next ? `Project ${next.number} · ${shortDate(next.startDate)}` : "—"],
              ].map(([k, v]) => (
                <li key={String(k)} className="flex justify-between gap-2 border-b border-mint-hover pb-2 last:border-b-0 last:pb-0">
                  <span>{k}</span>
                  <b className="text-right">{v}</b>
                </li>
              ))}
            </ul>
            <LinkButton href="/history" className="self-start">Review role history</LinkButton>
          </Card>

          <Card className="gap-2.5">
            <h2 className="text-xl font-bold">Role balance</h2>
            <p className="mb-1 text-[15px] text-muted">
              Students who have done each role so far (Projects 1–{currentProject.number}).
            </p>
            <ul className="flex flex-col gap-2.5">
              {roleBalance(state).map(({ role, count }) => (
                <li key={role.id} className="grid grid-cols-[24px_1fr_44px] items-center gap-2.5">
                  <RoleIcon role={role} />
                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span className="text-sm">{role.name}</span>
                    <span
                      role="meter"
                      aria-label={`${role.name}: ${count} of ${students} students`}
                      aria-valuemin={0}
                      aria-valuemax={students}
                      aria-valuenow={count}
                      className="h-2 overflow-hidden rounded-full bg-mint-2"
                    >
                      <span className="block h-full bg-ink" style={{ width: `${Math.round((count / students) * 100)}%` }} />
                    </span>
                  </span>
                  <b className="text-right text-[15px]">{count}</b>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {next && (
        <Modal
          open={confirmStart}
          onClose={() => setConfirmStart(false)}
          title={`Start Project ${next.number} · ${next.name}?`}
          actions={
            <>
              <Button onClick={() => setConfirmStart(false)}>Cancel</Button>
              <Button
                kind="primary"
                onClick={() => {
                  setConfirmStart(false);
                  toast(`Prototype: Project ${next.number} is set to start ${dayLabel(next.startDate)}. Planned roles are in Role history.`);
                }}
              >
                Start project
              </Button>
            </>
          }
        >
          <Timeline
            items={[
              { title: "Roles rotate automatically", sub: `No one keeps their Project ${currentProject.number} role.` },
              { title: "Tables lock", sub: "Only you can move students after the start." },
              { title: "You can still override", sub: "Every change needs a reason." },
            ]}
          />
        </Modal>
      )}
    </RoleGate>
  );
}
