"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { Avatar, ImagePlaceholder, Kicker } from "@/components/ui/Bits";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { TEACHER_ID } from "@/lib/mock-data";
import { nameOf, theClass, totalSeats } from "@/lib/selectors";

// No 0/O or 1/I, so codes are easy to read off a projector.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

const TERMS = [theClass.term, "2nd Sem AY 2026–27", "Summer 2027"];

// "CS 3A – Software Engineering" → section-ish prefix + course name, as the form asks for them.
const [DEMO_SECTION, DEMO_NAME] = theClass.name.split(" – ");

// Students who "join" while the invite screen is open, so the count reads as live.
const JOINERS = theClass.studentIds.slice(12, 20);
const AGO = ["just now", "1 min ago", "2 min ago", "3 min ago"];
const JOIN_EVERY_MS = 9000;

const card = "rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-md md:p-6";
const smallBtn = "press min-h-11 rounded-[10px] border-[1.5px] border-ink bg-white font-bold shadow-hard-sm hover:shadow-none";

/** HF05 · Create class, then share the invite code. */
export function CreateClass({ preview }: { preview: string }) {
  const { state, toast } = useDemo();
  const invite = preview === "invite";
  const [name, setName] = useState(invite ? DEMO_NAME : "");
  const [section, setSection] = useState(invite ? DEMO_SECTION : "");
  const [term, setTerm] = useState(theClass.term);
  const [error, setError] = useState(preview === "error");
  const [created, setCreated] = useState(invite);
  const [code, setCode] = useState(theClass.inviteCode);
  const [confirmNew, setConfirmNew] = useState(false);
  const [copied, setCopied] = useState<"" | "code" | "link">("");
  const [joined, setJoined] = useState(3);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const teacher = nameOf(TEACHER_ID);
  const link = `groupme.app/join/${code}`;
  const title = [section.trim(), name.trim()].filter(Boolean).join(" – ") || "Class name";
  const seats = totalSeats(state);

  // Simulated live joins while the code is on screen.
  useEffect(() => {
    if (!created) return;
    const t = setInterval(() => setJoined((n) => Math.min(n + 1, JOINERS.length)), JOIN_EVERY_MS);
    return () => clearInterval(t);
  }, [created]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const create = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(true);
    setCreated(true);
  };

  const copy = async (what: "code" | "link", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(""), 1800);
    } catch {
      toast(`Couldn’t copy. Select it instead: ${text}`);
    }
  };

  // Newest first.
  const recent = JOINERS.slice(0, joined).reverse().slice(0, AGO.length);

  return (
    <RoleGate allow="admin" title="Only teachers create classes" message="Have a code from your teacher? Join their class instead." action={{ href: "/join", label: "Join a class" }}>
      <PreviewBar
        current={{ state: preview }}
        groups={[{ param: "state", label: "State", options: [["", "Default"], ["error", "Missing name"], ["invite", "Success · invite code"]] }]}
      />
      {!created ? (
        <>
          <ScreenHeader title="Create a class" sub="You’ll get an invite code to share with students." />
          <div className="flex flex-wrap items-start gap-5">
            <form noValidate onSubmit={create} className={cn(card, "flex min-w-0 flex-[1_1_420px] flex-col gap-[18px]")}>
              {error && (
                <Banner kind="alert">
                  <b>One thing is missing.</b> Add a class name so students know they’re joining the right class.
                </Banner>
              )}
              <Field
                label="Class name *"
                value={name}
                required
                onChange={(e) => {
                  setName(e.target.value);
                  setError(false);
                }}
                placeholder="e.g. Software Engineering"
                error={error ? "Enter a class name." : undefined}
              />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3.5">
                <Field label="Section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. CS 3A" />
                <div className="flex min-w-0 flex-col gap-1">
                  <label htmlFor="class-term" className="text-[13px] font-bold text-ink-2">
                    Term
                  </label>
                  <select
                    id="class-term"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="min-h-12 w-full rounded-xl border-[1.5px] border-ink bg-white px-3 text-base text-ink shadow-hard-sm focus:shadow-[2px_2px_0_var(--color-primary)] focus:outline-none"
                  >
                    {TERMS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-muted">
                You’ll set up tables, seats, and roles next. Students only need their name and school email — no other personal details.
              </p>
              <Button kind="primary" type="submit" className="self-start" style={{ minHeight: 52, paddingInline: 24, fontSize: 17 }}>
                Create
              </Button>
            </form>
            <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-2.5">
              <Kicker>What students will see</Kicker>
              <div className="flex flex-col gap-1 rounded-2xl border-[1.5px] border-dashed border-muted-line bg-white p-5">
                <b className="text-[19px]">{title}</b>
                <span className="text-muted">
                  {teacher} · {term}
                </span>
              </div>
            </aside>
          </div>
        </>
      ) : (
        <>
          <h1 className="sr-only">Invite students to {title}</h1>
          <div className="mb-5">
            <Banner kind="success">
              <b>{title} is ready.</b> Share the code so students can join.
            </Banner>
          </div>
          <div className="flex flex-wrap items-start gap-5">
            <section aria-label="Invite" className={cn(card, "flex min-w-0 flex-[2_1_440px] flex-wrap gap-5")}>
              <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3.5">
                <span className="font-bold">Invite code</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span aria-label={`Invite code ${code.split("").join(" ")}`} className="font-mono text-[40px] font-bold leading-none tracking-[0.18em]">
                    {code}
                  </span>
                  <button type="button" onClick={() => copy("code", code)} className={cn(smallBtn, "px-4")}>
                    {copied === "code" ? "✓ Copied" : "Copy code"}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="invite-link" className="font-bold">
                    Invite link
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="invite-link"
                      readOnly
                      value={link}
                      onFocus={(e) => e.target.select()}
                      className="h-11 min-w-0 flex-1 rounded-[10px] border-[1.5px] border-ink bg-mint px-3 font-mono text-sm text-ink"
                    />
                    <button type="button" onClick={() => copy("link", `https://${link}`)} className={cn(smallBtn, "flex-none px-3.5")}>
                      {copied === "link" ? "✓ Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
                <span role="status" className="sr-only">
                  {copied && `${copied === "code" ? "Code" : "Link"} copied.`}
                </span>
                <Button kind="ghost" onClick={() => setConfirmNew(true)} className="self-start">
                  ↻ Make a new code
                </Button>
              </div>
              <div className="flex flex-[0_0_160px] flex-col items-center gap-2">
                <ImagePlaceholder label="QR code" className="h-40 w-40" />
                <span className="text-sm text-muted">Show on the projector</span>
              </div>
            </section>

            <section aria-labelledby="joined-h" className={cn(card, "flex min-w-0 flex-[1_1_280px] flex-col gap-3")}>
              <div className="flex items-baseline justify-between">
                <h2 id="joined-h" className="font-bold">Joined so far</h2>
                <span aria-live="polite">
                  <b className="text-2xl">{joined}</b> / {seats}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Students joined"
                aria-valuemin={0}
                aria-valuemax={seats}
                aria-valuenow={joined}
                className="h-2.5 overflow-hidden rounded-full bg-mint-2"
              >
                <div className="h-full bg-ink transition-[width]" style={{ width: `${(joined / seats) * 100}%` }} />
              </div>
              <ul className="flex flex-col gap-1.5 text-[15px]">
                {recent.map((id, i) => (
                  <li key={id} className="flex items-center gap-2">
                    <Avatar name={nameOf(id)} size="sm" />
                    {nameOf(id)} <span className="text-muted">· {AGO[i]}</span>
                  </li>
                ))}
              </ul>
              <span className="text-sm text-muted">Updates live as students join.</span>
              <LinkButton href="/admin/groups" kind="primary" className="self-start">
                Next: set up tables →
              </LinkButton>
            </section>
          </div>

          <Modal
            open={confirmNew}
            onClose={() => setConfirmNew(false)}
            title="Make a new code?"
            actions={
              <>
                <Button onClick={() => setConfirmNew(false)}>Cancel</Button>
                <Button
                  kind="primary"
                  onClick={() => {
                    setCode(newCode());
                    setConfirmNew(false);
                    toast("New code ready. The old one no longer works.");
                  }}
                >
                  Make new code
                </Button>
              </>
            }
          >
            <p>
              <span className="font-mono font-bold">{code}</span> stops working right away. Students already in the class stay in.
            </p>
          </Modal>
        </>
      )}
    </RoleGate>
  );
}
