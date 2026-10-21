"use client";

import { useId, useState, type FormEvent } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { Button, LinkButton } from "@/components/ui/Button";
import { useMode } from "@/lib/app-mode";
import { cn } from "@/lib/cn";
import { classes, ME_ID } from "@/lib/mock-data";
import { getUser, nameOf } from "@/lib/selectors";
import type { Class } from "@/lib/types";

type Result = { kind: "joined" | "already"; cls: Class } | { kind: "error"; code: string } | null;

const codeFrom = (text: string) => {
  const fromLink = text.match(/join\/([a-z0-9]{6})/i)?.[1];
  return (fromLink ?? text).trim().toUpperCase();
};

/** Invite codes are 6 letters or numbers; anything else is dropped as you type. */
const cleanCode = (text: string) => codeFrom(text).replace(/[^A-Z0-9]/g, "").slice(0, 6);

/** HF02 · Join class with a 6-character code or invite link. */
export function JoinClass({ preview }: { preview: string }) {
  const me = getUser(ME_ID)!;
  const { devTools } = useMode();
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [result, setResult] = useState<Result>(null);
  const hintId = useId();
  const errId = useId();

  const forced: Result =
    preview === "joined" ? { kind: "joined", cls: classes[0] } :
    preview === "already" ? { kind: "already", cls: classes[1] } :
    preview === "error" ? { kind: "error", code } : null;
  const shown = forced ?? result;
  const invalid = shown?.kind === "error";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const c = codeFrom(code || link);
    const cls = classes.find((k) => k.inviteCode === c);
    // The demo treats CS 3A as a fresh join so demo path A works; CS 2B shows "already joined".
    if (!cls) setResult({ kind: "error", code: c });
    else setResult({ kind: cls.id === classes[0].id ? "joined" : "already", cls });
  };

  return (
    <RoleGate allow="student" title="Teachers don’t join with a code" message="Create a class instead, and share its code with students." action={{ href: "/admin/classes/new", label: "Create a class" }}>
      <PreviewBar
        current={{ state: preview }}
        groups={[{ param: "state", label: "State", options: [["", "Default"], ["joined", "Success"], ["error", "Invalid code"], ["already", "Already joined"]] }]}
      />

      <div className="mx-auto flex w-full max-w-[520px] flex-col gap-5 md:pt-6">
        {shown?.kind === "joined" ? (
          <div role="status" className="flex flex-col gap-[18px] rounded-2xl border-[1.5px] border-ink bg-white px-6 py-7 shadow-hard-md">
            <span aria-hidden className="grid h-14 w-14 place-items-center rounded-full bg-ok-bg text-[28px] font-bold text-ok">
              ✓
            </span>
            <div>
              <h1 className="font-serif text-[39px] font-normal leading-[1.02] tracking-[-0.015em]">You’re in!</h1>
              <p className="mt-1.5 text-[19px] font-bold">{shown.cls.name}</p>
              <p className="mt-0.5 text-muted">
                Teacher: {nameOf(shown.cls.adminId)} · {shown.cls.term} · {shown.cls.studentIds.length - 1} classmates
              </p>
            </div>
            <ol aria-label="Next steps" className="flex flex-col gap-2.5">
              <li className="flex items-start gap-3">
                <span aria-hidden className="grid h-7 w-7 flex-none place-items-center rounded-full bg-ink text-sm font-bold text-white">1</span>
                <span>
                  <b>Find a table.</b> Sit with a group at the round table.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden className="grid h-7 w-7 flex-none place-items-center rounded-full bg-mint-2 text-sm font-bold">2</span>
                <span>
                  <b>Pick your role</b> when Project 1 starts. After that, roles rotate.
                </span>
              </li>
            </ol>
            <div className="flex flex-wrap gap-2.5">
              <LinkButton href="/student" kind="primary" className="min-h-12 px-5">
                Go to class
              </LinkButton>
              <LinkButton href="/groups" className="min-h-12 px-5">
                Find a table
              </LinkButton>
            </div>
          </div>
        ) : (
          <>
            <ScreenHeader
              title="Join a class"
              kicker={`Signed in as ${me.name}`}
              sub="Enter the 6-character code from your teacher, or paste the invite link they shared."
            />

            {invalid && (
              <div id={errId}>
                <Banner kind="alert">
                  <b>That code didn’t work.</b> Check with your teacher.
                  {shown.code && ` (You entered ${shown.code}.)`}
                </Banner>
              </div>
            )}
            {shown?.kind === "already" && (
              <div role="status" className="flex flex-col gap-2.5 rounded-xl border-[1.5px] border-ink bg-mint-2 px-4 py-3.5 text-[15px]">
                <span>
                  <b>You’re already in {shown.cls.name}.</b> No need to join again.
                </span>
                <LinkButton href="/student" small className="self-start">
                  Open that class
                </LinkButton>
              </div>
            )}

            <form noValidate onSubmit={submit} className="flex flex-col gap-[18px] rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-md md:p-6">
              <div className="flex flex-col gap-2">
                <label htmlFor={`${hintId}-code`} className="font-bold">
                  Invite code
                </label>
                <input
                  id={`${hintId}-code`}
                  value={code}
                  onChange={(e) => {
                    setCode(cleanCode(e.target.value));
                    setResult(null);
                  }}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ABC123"
                  aria-invalid={invalid}
                  aria-describedby={invalid ? `${errId} ${hintId}` : hintId}
                  className={cn(
                    "h-[68px] w-full rounded-xl bg-white px-4 text-center font-mono text-[30px] font-bold uppercase tracking-[0.35em] text-ink placeholder:text-muted-line",
                    invalid ? "border-2 border-bad-dot" : "border-[1.5px] border-ink",
                  )}
                />
                <span id={hintId} className="text-sm text-muted">
                  6 letters or numbers.
                  {devTools && ` In this prototype, try ${classes[0].inviteCode} or ${classes[1].inviteCode}.`}
                </span>
              </div>

              <div aria-hidden className="flex items-center gap-3 text-sm text-muted">
                <span className="h-px flex-1 bg-mint-line" />
                or
                <span className="h-px flex-1 bg-mint-line" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor={`${hintId}-link`} className="font-bold">
                  Invite link
                </label>
                <input
                  id={`${hintId}-link`}
                  value={link}
                  onChange={(e) => {
                    setLink(e.target.value);
                    setResult(null);
                  }}
                  placeholder="groupme.app/join/…"
                  inputMode="url"
                  autoComplete="off"
                  className="h-[50px] w-full rounded-[10px] border-[1.5px] border-ink bg-white px-3.5 text-ink shadow-hard-sm placeholder:text-muted-2"
                />
              </div>

              <Button kind="primary" type="submit" className="min-h-[52px] text-[17px]" disabled={!code && !link}>
                Join
              </Button>
            </form>

            <p className="text-sm text-muted">Joining only adds you to the class list. You’ll pick a table (group) next.</p>
          </>
        )}
      </div>
    </RoleGate>
  );
}
