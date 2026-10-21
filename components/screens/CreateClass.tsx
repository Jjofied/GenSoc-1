"use client";

import { useState, type FormEvent } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { RoleGate } from "@/components/RoleGate";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Avatar, ImagePlaceholder, ProgressBar } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useDemo } from "@/lib/demo-store";
import { TEACHER_ID } from "@/lib/mock-data";
import { nameOf, theClass, totalSeats } from "@/lib/selectors";

// No 0/O or 1/I, so codes are easy to read off a projector.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

const JOINED = [
  { id: theClass.studentIds[12], ago: "just now" },
  { id: theClass.studentIds[13], ago: "1 min" },
  { id: theClass.studentIds[14], ago: "2 min" },
];

/** WF05 · Create class, then share the invite code. */
export function CreateClass({ preview }: { preview: string }) {
  const { state, toast } = useDemo();
  const [name, setName] = useState(preview === "invite" ? theClass.name : "");
  const [section, setSection] = useState(preview === "invite" ? theClass.section : "");
  const [term, setTerm] = useState(theClass.term);
  const [error, setError] = useState(preview === "error");
  const [created, setCreated] = useState(preview === "invite");
  const [code, setCode] = useState(theClass.inviteCode);
  const [confirmNew, setConfirmNew] = useState(false);
  const teacher = nameOf(TEACHER_ID);
  const link = `groupme.app/join/${code}`;
  const short = name.split(" – ")[0] || "Your class";

  const create = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(true);
    setCreated(true);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard.");
    } catch {
      toast(`Couldn’t copy. Select it instead: ${text}`);
    }
  };

  return (
    <RoleGate allow="admin" title="Only teachers create classes" message="Have a code from your teacher? Join their class instead." action={{ href: "/join", label: "Join a class" }}>
      <PreviewBar
        current={{ state: preview }}
        groups={[{ param: "state", label: "State", options: [["", "Step 1 · Details"], ["error", "Missing name"], ["invite", "Step 2 · Invite code"]] }]}
      />
      {!created ? (
        <>
          <ScreenHeader id="WF05" title="Create a class" sub="You’ll get an invite code next" />
          <BlockGrid>
            <Block span={7} strong label="Class details">
              <form noValidate onSubmit={create} className="flex flex-col gap-3">
                <Field
                  label="Class name *"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(false);
                  }}
                  placeholder="CS 3A – Software Engineering"
                  error={error ? "Add a class name, so students know they’re joining the right class." : undefined}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="3A" />
                  <Field label="Term" value={term} onChange={(e) => setTerm(e.target.value)} />
                </div>
                <p className="text-xs text-muted">Students only need their name and school email.</p>
                <Button kind="primary" type="submit" className="self-start">Create</Button>
              </form>
            </Block>
            <Block span={5} label="What students will see">
              <div className="rounded-md border-[1.5px] border-dashed border-line p-3">
                <p className="font-semibold">{name || "Class name"}</p>
                <p className="text-xs text-muted">
                  {teacher} · {[section && `Section ${section}`, term].filter(Boolean).join(" · ")}
                </p>
              </div>
            </Block>
          </BlockGrid>
        </>
      ) : (
        <>
          <ScreenHeader id="WF05" title={`${short} is ready`} sub="Share the code so students can join" />
          <BlockGrid>
            <Block span={8} strong label="Invite">
              <div className="flex flex-wrap items-center gap-5">
                <p aria-label={`Invite code ${code.split("").join(" ")}`} className="flex gap-1.5">
                  {code.split("").map((ch, i) => (
                    <span key={i} aria-hidden className="grid h-14 w-11 place-items-center rounded-md border-2 border-ink bg-white font-mono text-3xl font-bold">
                      {ch}
                    </span>
                  ))}
                </p>
                <ImagePlaceholder label="QR code" className="h-24 w-24" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button kind="primary" onClick={() => copy(code)}>Copy code</Button>
                <Button onClick={() => copy(`https://${link}`)}>Copy link</Button>
              </div>
              <p className="font-mono text-xs text-muted">{link}</p>
              <button type="button" onClick={() => setConfirmNew(true)} className="self-start text-xs font-semibold text-accent hover:text-accent-strong">
                ↻ Make a new code. The old one stops working.
              </button>
            </Block>
            <Block span={4} label="Joined so far">
              <ProgressBar label={`${JOINED.length} of ${totalSeats(state)}`} value={JOINED.length / totalSeats(state)} />
              <ul className="flex flex-col gap-2">
                {JOINED.map((j) => (
                  <li key={j.id} className="flex items-center gap-2 text-sm">
                    <Avatar name={nameOf(j.id)} size="sm" />
                    {nameOf(j.id)} <span className="text-xs text-muted">· {j.ago}</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="/admin/groups" kind="primary">Next: set up tables</LinkButton>
            </Block>
          </BlockGrid>

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
                  New code
                </Button>
              </>
            }
          >
            <p>{code} stops working. Students already in stay in.</p>
          </Modal>
        </>
      )}
    </RoleGate>
  );
}
