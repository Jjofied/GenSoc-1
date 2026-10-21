"use client";

import { useId, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { RoleIcon } from "@/components/RoleChip";
import { Banner } from "@/components/ui/Banner";
import { PreviewBar } from "@/components/PreviewBar";
import { Logo } from "@/components/shell/Logo";
import { useAppRouter } from "@/lib/app-mode";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { getUser, activeRoles } from "@/lib/selectors";
import { ME_ID, TEACHER_ID } from "@/lib/mock-data";
import type { UserType } from "@/lib/types";

const DEMO_EMAIL: Record<UserType, string> = {
  student: getUser(ME_ID)!.email,
  admin: getUser(TEACHER_ID)!.email,
};

// Short labels for the rotation strip (hi-fi 5a). Custom roles fall back to their full name.
const SHORT: Record<string, string> = {
  "Team Leader": "Leader",
  "Lead Programmer": "Programmer",
  "System Designer": "Designer",
  "Debugger & Tester": "Tester",
};

const pill = "inline-flex min-h-11 items-center gap-[7px] whitespace-nowrap rounded-full border-[1.5px] border-ink bg-white text-[13px] font-bold text-ink shadow-hard-sm";

/** Small outlined glyph circle used inside the header and feature pills. */
function PillGlyph({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden className="grid h-4 w-4 flex-none place-items-center rounded-full border-[1.5px] border-ink text-[9px] font-extrabold">
      {children}
    </span>
  );
}

/** Pill input from the sign-in hi-fi: 54px, 3px hard shadow that turns primary on focus. */
function PillField({
  label,
  error,
  invalid = !!error,
  describedBy,
  trailing,
  ...props
}: ComponentProps<"input"> & { label: string; error?: string; invalid?: boolean; describedBy?: string; trailing?: ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-bold text-ink-2">
        {label}
      </label>
      <div className="relative flex">
        <input
          id={id}
          aria-invalid={invalid}
          aria-describedby={error ? `${id}-err` : describedBy}
          className={cn(
            "h-[54px] min-w-0 flex-1 rounded-full bg-white px-5 text-base text-ink shadow-hard placeholder:text-muted-2 focus:shadow-[3px_3px_0_var(--color-primary)] focus:outline-none",
            invalid ? "border-2 border-bad-dot" : "border-[1.5px] border-ink",
            !!trailing && "pr-[84px]",
          )}
          {...props}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-err`} className="flex items-center gap-1.5 text-sm font-bold text-bad">
          <span aria-hidden className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-bad-dot text-[11px] text-white">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

/** HF01 · Sign in (hi-fi exploration 5a). Mock: any password works; no account is checked. */
export function SignIn({ preview, signedOut }: { preview: string; signedOut: boolean }) {
  const router = useAppRouter();
  const { state, signIn, toast } = useDemo();
  const [type, setType] = useState<UserType>("student");
  const [email, setEmail] = useState(DEMO_EMAIL.student);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [shared, setShared] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const forcedError = preview === "error";
  const roles = activeRoles(state);

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

  // The forced preview is the "wrong password" case: red banner, both fields marked invalid.
  const bannerId = useId();

  return (
    <>
      <PreviewBar
        current={{ state: preview, signedout: signedOut ? "1" : "" }}
        groups={[
          { param: "state", label: "State", options: [["", "Default"], ["error", "Wrong password"]] },
          { param: "signedout", label: "Banner", options: [["", "None"], ["1", "Signed out"]] },
        ]}
      />

      <div className="flex flex-col gap-8 md:gap-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Logo href="/" size="lg" />
          <nav aria-label="Sign-in shortcuts" className="flex flex-wrap gap-2.5">
            <button type="button" onClick={() => chooseType("admin")} className={cn(pill, "press hidden px-4 hover:shadow-none sm:inline-flex")}>
              For teachers
            </button>
            <button type="button" onClick={() => submit("/join", "student")()} className={cn(pill, "press pl-[11px] pr-4 hover:shadow-none")}>
              <PillGlyph>#</PillGlyph>
              Join a class
            </button>
          </nav>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 xl:gap-24">
          <div className="flex min-w-0 flex-col gap-5 md:gap-7">
            <h1 className="text-balance font-serif text-[52px] font-normal leading-[0.96] tracking-[-0.025em] sm:text-[72px] xl:text-[104px]">
              Fair roles, <br className="hidden sm:inline" />
              every <em className="text-primary">single</em> project.
            </h1>
            <p className="max-w-[40ch] text-pretty text-[17px] text-ink-2 md:text-[19px]">
              A round table for your class. Students sit, choose a role once, then rotate through all six — lead, code, design, test, document, present.
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {[
                ["✓", "Never twice in a row"],
                ["⊘", "No gender field"],
              ].map(([g, text]) => (
                <li key={text} className={cn(pill, "min-h-0 py-[5px] pl-[9px] pr-3.5")}>
                  <PillGlyph>{g}</PillGlyph>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <form noValidate onSubmit={submit()} aria-labelledby="signin-title" className="flex flex-col gap-5">
            <h2 id="signin-title" className="sr-only">
              Sign in
            </h2>

            {signedOut && !state.viewAs && (
              <Banner kind="success">
                <b>You’re signed out.</b> On a shared computer, close this browser window too.
              </Banner>
            )}
            {forcedError && (
              <div id={bannerId}>
                <Banner kind="alert">
                  <b>That password didn’t match.</b> It happens. Try again, or reset it with “Forgot password?” below.
                </Banner>
              </div>
            )}

            <div role="group" aria-label="I’m signing in as" className="grid grid-cols-2 gap-2.5">
              {(
                [
                  ["student", "Student"],
                  ["admin", "Teacher"],
                ] as const
              ).map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={type === t}
                  onClick={() => chooseType(t)}
                  className={cn(
                    "h-[46px] rounded-full text-[15px]",
                    type === t
                      ? "border-[1.5px] border-ink bg-white font-bold text-ink shadow-hard-sm"
                      : "border-[1.5px] border-dashed border-muted-2 bg-transparent font-semibold text-muted-2 hover:border-solid hover:border-ink hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <PillField
              label="School email"
              type="email"
              autoComplete="email"
              placeholder="name@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              invalid={!!errors.email || forcedError}
              describedBy={forcedError ? bannerId : undefined}
            />
            <PillField
              label="Password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              invalid={!!errors.password || forcedError}
              describedBy={forcedError ? bannerId : undefined}
              trailing={
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-[9px] top-[9px] h-9 rounded-full border-[1.5px] border-ink bg-mint px-3.5 text-[13px] font-bold text-ink hover:bg-mint-2"
                >
                  {show ? "Hide" : "Show"}
                </button>
              }
            />

            <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-sm text-ink-2">
              <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] flex-none accent-ink" />
              Shared computer? Sign me out when I close this tab.
            </label>

            <button
              type="submit"
              className="press h-14 rounded-full border-[1.5px] border-ink bg-primary text-base font-bold text-white shadow-hard-md hover:bg-primary-hover hover:shadow-hard"
            >
              Sign in →
            </button>

            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <button
                type="button"
                className="min-h-11 text-muted-2 underline underline-offset-4 hover:text-ink"
                onClick={() => toast("Password reset isn’t in this prototype yet.")}
              >
                Forgot password?
              </button>
              <button
                type="button"
                className="min-h-11 font-bold text-ink underline underline-offset-4 hover:text-muted"
                onClick={() => toast("Create account isn’t in this prototype yet. Sign in works with any password.")}
              >
                Create account
              </button>
            </div>

            <p className="text-pretty border-t-[1.5px] border-dashed border-ink/30 pt-3.5 text-[13px] text-muted-2">
              <b className="text-ink">We never ask for gender.</b> Roles are assigned by rotation, not by who you are.
            </p>
          </form>
        </div>

        <footer className="flex flex-col gap-3.5 border-t-[1.5px] border-ink pt-6">
          <ol aria-label="Role rotation" className="flex flex-wrap items-center gap-2">
            {roles.map((r, i) => (
              <li key={r.id} className="flex items-center gap-2">
                <span
                  title={r.name}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-ink bg-white py-[3px] pl-[3px] pr-3.5 text-[13.5px] font-bold shadow-hard-sm"
                >
                  <RoleIcon role={r} />
                  {SHORT[r.name] ?? r.name}
                </span>
                {i < roles.length - 1 && (
                  <span aria-hidden className="text-[15px] text-muted-2">
                    →
                  </span>
                )}
              </li>
            ))}
            <li aria-hidden className="text-lg font-extrabold text-primary">
              ↺
            </li>
          </ol>
          <p className="text-[13px] text-muted-2">
            Project 1: students choose · from Project 2, roles rotate automatically — never the same role twice in a row.
          </p>
        </footer>
      </div>
    </>
  );
}
