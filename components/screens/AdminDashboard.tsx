"use client";

import { AppLink as Link } from "@/lib/app-mode";
import { useState } from "react";
import { GroupStatusLabel } from "@/components/GroupStatusLabel";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleGate } from "@/components/RoleGate";
import { RoundTable } from "@/components/RoundTable";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { KeyValue, ProgressBar, Timeline } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StateCard } from "@/components/ui/StateCard";
import { useDemo } from "@/lib/demo-store";
import { dayLabel, shortDate } from "@/lib/format";
import {
  currentProject, groupStatus, membersOf, nextProject, overrideCount, repeatCount,
  roleBalance, roleFor, theClass, totalSeats,
} from "@/lib/selectors";

/** WF04 · Teacher class overview (canvas Option A · Alerts first). */
export function AdminDashboard({ preview }: { preview: string }) {
  const { state, toast } = useDemo();
  const [confirmStart, setConfirmStart] = useState(false);
  const started = currentProject.status === "active";
  const withStatus = state.groups.map((g) => ({ g, status: groupStatus(g, started) }));
  const alerts = withStatus.filter((x) => x.status === "not-full-started");
  const students = theClass.studentIds.length;
  const next = nextProject;

  return (
    <RoleGate allow="admin" title="Only teachers see the class overview" message="Your dashboard has your role, your group and what’s due." action={{ href: "/student", label: "Go to my dashboard" }}>
      <PreviewBar current={{ state: preview }} groups={[{ param: "state", label: "State", options: [["", "Default"], ["empty", "No class yet"]] }]} />
      <ScreenHeader
        id="WF04"
        title="Class overview"
        sub={preview === "empty" ? "Welcome, Prof. Kim" : `CS 3A · ${students} of ${totalSeats(state)} joined · Project ${currentProject.number} started ${dayLabel(currentProject.startDate)}`}
        actions={<LinkButton href="/admin/classes/new" small>＋ Create class</LinkButton>}
      />

      {preview === "empty" ? (
        <StateCard kind="empty" title="No class yet" action={<LinkButton href="/admin/classes/new" kind="primary">Create a class</LinkButton>}>
          <ol className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
            <li>1 Create class</li>
            <li aria-hidden>→</li>
            <li>2 Set up tables</li>
            <li aria-hidden>→</li>
            <li>3 Share code</li>
          </ol>
        </StateCard>
      ) : (
        <BlockGrid>
          <Block span={12} label="Needs attention" go={{ href: "/groups", label: "Round table" }}>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted">Nothing needs attention. Every table is full.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {alerts.map(({ g }) => (
                  <li key={g.id}>
                    <Banner kind="alert" action={<LinkButton href={`/groups?fix=${g.id}`} kind="primary" small>Fix group</LinkButton>}>
                      <b>{g.name} isn’t full:</b> {membersOf(g).length} of {g.seats.length} seats. Project {currentProject.number} has started.
                    </Banner>
                  </li>
                ))}
              </ul>
            )}
          </Block>

          <Block span={8} label="Tables">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {withStatus.map(({ g, status }) => (
                <li key={g.id}>
                  <Link href={`/groups?fix=${g.id}`} className="flex flex-col items-center gap-1.5 rounded-md p-2 text-center hover:bg-fill-soft">
                    <RoundTable label={g.name.replace("Table ", "T")} seats={g.seats} size="sm" roleOf={(id) => roleFor(state, id, currentProject.id)} />
                    <span className="text-sm font-semibold">
                      {g.name} · {membersOf(g).length}/{g.seats.length}
                    </span>
                    <GroupStatusLabel status={status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Block>

          <Block span={4} label="Quick actions" go={{ href: "/posts", label: "Posts" }}>
            <div className="flex flex-col gap-2">
              <LinkButton href="/posts?compose=file" kind="primary">＋ Post file</LinkButton>
              <LinkButton href="/posts?compose=meeting">＋ Schedule meeting</LinkButton>
              <LinkButton href="/posts?compose=deadline">＋ Add deadline</LinkButton>
              <Button onClick={() => setConfirmStart(true)}>＋ Start new project</Button>
            </div>
          </Block>

          <Block span={6} label="Rotation status" go={{ href: "/history", label: "Role history" }}>
            <KeyValue
              items={[
                [`Roles rotated for Project ${currentProject.number}`, `${shortDate(currentProject.startDate)} ✓`],
                ["Same role twice in a row", repeatCount(state)],
                ["Teacher overrides", overrideCount(state)],
                ["Next rotation", nextProject ? dayLabel(nextProject.startDate) : "—"],
              ]}
            />
          </Block>

          <Block span={6} label="Role balance · students who’ve done each role">
            <div className="flex flex-col gap-2">
              {roleBalance(state).map(({ role, count }) => (
                <ProgressBar key={role.id} label={`${role.icon}  ${role.name}`} value={count / students} note={count} />
              ))}
            </div>
          </Block>
        </BlockGrid>
      )}

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
