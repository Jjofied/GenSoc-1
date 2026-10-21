"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RoleChip } from "@/components/RoleChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { ImagePlaceholder } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button } from "@/components/ui/Button";
import { Field, Toggle } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { PreviewBar } from "@/components/PreviewBar";
import { useDemo } from "@/lib/demo-store";
import { getUser, activeRoles } from "@/lib/selectors";
import { ME_ID, TEACHER_ID } from "@/lib/mock-data";
import type { UserType } from "@/lib/types";

const DEMO_EMAIL: Record<UserType, string> = {
  student: getUser(ME_ID)!.email,
  admin: getUser(TEACHER_ID)!.email,
};

/** WF01 · Sign in. Mock: any password works; no account is checked. */
export function SignIn({ preview, signedOut }: { preview: string; signedOut: boolean }) {
  const router = useRouter();
  const { state, signIn, toast } = useDemo();
  const [type, setType] = useState<UserType>("student");
  const [email, setEmail] = useState(DEMO_EMAIL.student);
  const [password, setPassword] = useState("");
  const [shared, setShared] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const forcedError = preview === "error";

  const chooseType = (t: UserType) => {
    setType(t);
    if (Object.values(DEMO_EMAIL).includes(email) || !email) setEmail(DEMO_EMAIL[t]);
  };

  const submit = (next?: string, as: UserType = type) => (e?: FormEvent) => {
    e?.preventDefault();
    const errs = {
      email: !email.trim() ? "Enter your school email." : !email.includes("@") ? "That doesn't look like an email. Check for an @." : undefined,
      password: !password ? "Enter your password." : undefined,
    };
    setErrors(errs);
    if (errs.email || errs.password || forcedError) return;
    signIn(as, shared);
    router.push(next ?? (as === "admin" ? "/admin" : "/student"));
  };

  const passwordError = forcedError
    ? "That password didn’t match. It happens. Try again, or reset it with “Forgot password?”."
    : errors.password;

  return (
    <>
      <PreviewBar current={{ state: preview }} groups={[{ param: "state", label: "State", options: [["", "Default"], ["error", "Wrong password"]] }]} />
      <ScreenHeader id="WF01" title="Sign in" sub="Use your school email" />

      {signedOut && !state.viewAs && (
        <div className="mb-4">
          <Banner>
            <b>You’re signed out.</b> On a shared computer, close the browser too.
          </Banner>
        </div>
      )}

      <BlockGrid>
        <Block span={6}>
          <p className="text-4xl font-bold tracking-tight">groupme</p>
          <p className="text-lg font-semibold">Fair roles. Every project.</p>
          <p className="text-sm text-ink-2">
            Group roles rotate every project, so everyone gets to lead, code, design, test, write and present.
          </p>
          <ImagePlaceholder label="brand illustration" className="h-28" />
          <ul aria-label="The six roles" className="flex flex-wrap gap-1.5">
            {activeRoles(state).map((r) => (
              <li key={r.id}>
                <RoleChip role={r} />
              </li>
            ))}
          </ul>
        </Block>

        <Block span={6} strong>
          <form noValidate onSubmit={submit()} className="flex flex-col gap-3.5">
            <Segmented label="I am a" options={[["student", "Student"], ["admin", "Teacher"]] as const} value={type} onChange={chooseType} className="self-start" />
            <Field label="School email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              hint="Prototype: any password works."
            />
            <Toggle label="Shared computer: sign me out when I close the browser" checked={shared} onChange={setShared} />
            <div className="flex flex-wrap gap-2">
              <Button kind="primary" type="submit">Sign in</Button>
              <Button onClick={() => toast("Create account isn’t in this prototype yet. Sign in works with any password.")}>Create account</Button>
            </div>
            <p className="flex flex-wrap gap-x-2 text-xs">
              <button type="button" className="font-semibold text-accent hover:text-accent-strong" onClick={() => toast("Password reset isn’t in this prototype yet.")}>
                Forgot password?
              </button>
              <span aria-hidden>·</span>
              <button
                type="button"
                className="font-semibold text-accent hover:text-accent-strong"
                onClick={() => submit("/join", "student")()}
              >
                Have an invite code? Join a class
              </button>
            </p>
            <Banner>We never ask for gender. Roles are assigned by rotation, not by who you are.</Banner>
          </form>
        </Block>
      </BlockGrid>
    </>
  );
}
