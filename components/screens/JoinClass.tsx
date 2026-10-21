"use client";

import { useState, type FormEvent } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Timeline } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StateCard } from "@/components/ui/StateCard";
import { classes, ME_ID } from "@/lib/mock-data";
import { getUser, nameOf } from "@/lib/selectors";
import type { Class } from "@/lib/types";

type Result = { kind: "joined" | "already"; cls: Class } | { kind: "error" } | null;

const codeFrom = (text: string) => {
  const fromLink = text.match(/join\/([a-z0-9]{6})/i)?.[1];
  return (fromLink ?? text).trim().toUpperCase();
};

/** WF02 · Join class with a 6-character code or invite link. */
export function JoinClass({ preview }: { preview: string }) {
  const me = getUser(ME_ID)!;
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [result, setResult] = useState<Result>(null);

  const forced: Result =
    preview === "joined" ? { kind: "joined", cls: classes[0] } :
    preview === "already" ? { kind: "already", cls: classes[1] } :
    preview === "error" ? { kind: "error" } : null;
  const shown = forced ?? result;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const c = codeFrom(code || link);
    const cls = classes.find((k) => k.inviteCode === c);
    // The demo treats CS 3A as a fresh join so demo path A works; CS 2B shows "already joined".
    if (!cls) setResult({ kind: "error" });
    else setResult({ kind: cls.id === classes[0].id ? "joined" : "already", cls });
  };

  return (
    <RoleGate allow="student" title="Teachers don’t join with a code" message="Create a class instead, and share its code with students." action={{ href: "/admin/classes/new", label: "Create a class" }}>
      <PreviewBar
        current={{ state: preview }}
        groups={[{ param: "state", label: "State", options: [["", "Default"], ["joined", "Success"], ["error", "Invalid code"], ["already", "Already joined"]] }]}
      />
      <ScreenHeader id="WF02" title="Join a class" sub={`Signed in as ${me.name}`} />

      {shown?.kind === "joined" || shown?.kind === "already" ? (
        <StateCard
          kind={shown.kind === "joined" ? "success" : "info"}
          title={shown.kind === "joined" ? `You’re in ${shown.cls.name}` : "You’re already in this class"}
          action={<LinkButton href="/student" kind="primary">{shown.kind === "joined" ? "Go to class" : "Open class"}</LinkButton>}
        >
          {shown.kind === "joined"
            ? `Teacher: ${nameOf(shown.cls.adminId)} · ${shown.cls.studentIds.length - 1} classmates`
            : shown.cls.name}
        </StateCard>
      ) : (
        <BlockGrid>
          <Block span={8} strong label="Invite code">
            <form noValidate onSubmit={submit} className="flex flex-col gap-3">
              <p className="text-sm">Enter the 6-character code from your teacher.</p>
              <Field
                label="Invite code · 6 characters"
                value={code}
                onChange={(e) => {
                  setCode(codeFrom(e.target.value).slice(0, 6));
                  setResult(null);
                }}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder="K7Q2MX"
                className="font-mono"
                error={shown?.kind === "error" ? "That code didn’t work. Check with your teacher." : undefined}
              />
              <p className="text-center text-xs text-muted">— or —</p>
              <Field
                label="Paste invite link"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  setResult(null);
                }}
                placeholder="groupme.app/join/K7Q2MX"
                inputMode="url"
              />
              <Button kind="primary" type="submit" className="self-start" disabled={!code && !link}>
                Join
              </Button>
            </form>
          </Block>
          <Block span={4} label="What happens next">
            <Timeline
              items={[
                { title: "Join class", sub: "You are here", current: true },
                { title: "Find a table", sub: "Sit with a group" },
                { title: "Pick a role", sub: "Project 1 only. Then roles rotate." },
              ]}
            />
          </Block>
        </BlockGrid>
      )}
    </RoleGate>
  );
}
