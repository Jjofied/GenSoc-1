"use client";

import { AppLink as Link } from "@/lib/app-mode";
import { useState, type CSSProperties, type FormEvent } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LinkButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StateCard } from "@/components/ui/StateCard";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo-store";
import { downloadSampleFile } from "@/lib/download";
import { agoLabel, dayLabel, shortDate, TODAY_TIME, whenLabel } from "@/lib/format";
import { POST_TYPE } from "@/lib/labels";
import { TEACHER_ID } from "@/lib/mock-data";
import { nameOf, theClass } from "@/lib/selectors";
import type { Post, PostType } from "@/lib/types";

const FILTERS = [["all", "All"], ["file", "Files & modules"], ["meeting", "Meetings"], ["deadline", "Deadlines"]] as const;
type Filter = (typeof FILTERS)[number][0];

const TYPES = [["announcement", "Announcement"], ["file", "File"], ["meeting", "Meeting"], ["deadline", "Deadline"]] as const;
const isType = (v: string): v is PostType => TYPES.some(([t]) => t === v);

const TITLE_PLACEHOLDER: Record<PostType, string> = {
  announcement: "e.g. Reminder about Friday",
  file: "e.g. Lecture 9 slides",
  meeting: "e.g. Code review",
  deadline: "e.g. Demo video due",
};

function formatSize(bytes: number) {
  return bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

const fileExt = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase().slice(0, 4) : "FILE");

function Composer({ initialType }: { initialType: PostType }) {
  const { addPost, toast } = useDemo();
  const [type, setType] = useState<PostType>(initialType);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dated = type === "meeting" || type === "deadline";
  const canPost = title.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Add a title.";
    if (dated && !date) errs.date = `Pick a date for the ${type}.`;
    if (type === "file" && !file) errs.file = "Attach the file to share.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const dateTime = dated ? `${date}T${time || (type === "deadline" ? "23:59" : "09:00")}` : undefined;
    const post: Post = {
      id: `post-${Date.now()}`,
      classId: theClass.id,
      type,
      title: title.trim(),
      body: body.trim(),
      postedAt: TODAY_TIME,
      ...(file ? { attachment: file } : {}),
      ...(dateTime ? { dateTime } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
    };
    addPost(post);
    toast(dateTime ? `Posted · added to calendar on ${dayLabel(dateTime)}` : "Posted to class");
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setBody("");
    setFile(null);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-ink bg-white p-5 shadow-hard-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">New post</h2>
        <div role="group" aria-label="Post type" className="flex flex-wrap gap-1 rounded-[10px] bg-mint-2 p-[3px]">
          {TYPES.map(([t, label]) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => setType(t)}
              className={cn("h-9 rounded-lg px-3 text-sm font-bold text-ink", type === t ? "bg-white" : "hover:bg-mint-hover")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <Field
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder={TITLE_PLACEHOLDER[type]}
        autoFocus={initialType !== "announcement"}
      />
      <Field label="Description" multiline rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add details for students" />
      {dated && (
        <>
          <div className="flex flex-wrap items-start gap-2.5">
            <Field className="flex-[1_1_140px]" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
            <Field
              className="flex-[1_1_120px]"
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              hint={type === "deadline" ? "Blank = 11:59 PM" : "Blank = 9 AM"}
            />
            {type === "meeting" && (
              <Field className="flex-[2_1_200px]" label="Room or link" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 304 · meet link" />
            )}
          </div>
          <p className="flex items-center gap-2 text-sm text-ok">
            <b aria-hidden>▦</b> This will be added to the calendar automatically.
          </p>
        </>
      )}
      <label
        className={cn(
          "grid min-h-16 cursor-pointer place-items-center rounded-xl border-[1.5px] border-dashed px-3 py-3 text-center text-[15px] text-ink-2",
          "bg-[repeating-linear-gradient(45deg,var(--color-mint)_0_8px,#fff_8px_16px)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
          errors.file ? "border-bad-dot" : "border-muted-line",
        )}
      >
        <input
          type="file"
          className="sr-only"
          aria-invalid={!!errors.file}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setFile(f ? { name: f.name, size: formatSize(f.size) } : null);
          }}
        />
        {file ? (
          <span>
            <b>▤ {file.name}</b> · {file.size} · <b className="underline">change</b>
          </span>
        ) : (
          <span>
            {type === "file" ? "Drop the file or module here, or" : "Attach a file (optional): drop here, or"} <b className="underline">browse</b>
          </span>
        )}
      </label>
      {errors.file && (
        <p className="flex items-center gap-1.5 text-sm font-bold text-bad">
          <span aria-hidden className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-bad-dot text-[11px] text-white">!</span>
          {errors.file}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canPost}
          className="h-[46px] rounded-[10px] bg-ink px-5 font-bold text-white disabled:cursor-not-allowed disabled:bg-muted-line"
        >
          Post to class
        </button>
      </div>
    </form>
  );
}

function PostCard({ post, teacherName }: { post: Post; teacherName: string }) {
  const t = POST_TYPE[post.type];
  const tone: CSSProperties = { background: t.bg, color: t.fg, border: t.border };
  return (
    <article className="flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-ink bg-white px-5 py-[18px] shadow-hard-md">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-[3px] text-[13px] font-bold" style={tone}>
          <span aria-hidden>{t.glyph}</span> {t.label}
        </span>
        <span className="text-sm text-muted">
          {shortDate(post.postedAt)} · {teacherName} · {agoLabel(post.postedAt)}
        </span>
      </div>
      <h2 className="text-[19px] font-bold leading-snug">{post.title}</h2>
      {post.body && <p className="text-pretty text-ink-2">{post.body}</p>}
      {post.attachment && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border-[1.5px] border-ink bg-mint px-3 py-2.5">
          <span aria-hidden className="grid h-11 w-11 flex-none place-items-center rounded-lg border-[1.5px] border-ink bg-white font-mono text-[11px] font-bold">
            {fileExt(post.attachment.name)}
          </span>
          <span className="min-w-0 flex-[1_1_160px]">
            <b className="break-all">{post.attachment.name}</b>
            <br />
            <span className="text-sm text-muted">{post.attachment.size}</span>
          </span>
          <button
            type="button"
            onClick={() => downloadSampleFile(post.attachment!.name)}
            aria-label={`Download ${post.attachment.name}`}
            className="press h-11 rounded-[10px] border-[1.5px] border-ink bg-white px-4 font-bold shadow-hard-sm hover:shadow-none"
          >
            ↓ Download
          </button>
        </div>
      )}
      {post.dateTime && (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[15px]">
          <b>
            {whenLabel(post.dateTime)}
            {post.location && ` · ${post.location}`}
          </b>
          <Link href="/calendar" className="text-sm font-bold text-ok underline underline-offset-4 hover:text-ink">
            ✓ On calendar
          </Link>
        </div>
      )}
    </article>
  );
}

/** WF10 · Posts: files, meetings, deadlines. Teachers post; students read and download. */
export function PostsScreen({ preview, compose }: { preview: string; compose: string }) {
  const { state } = useDemo();
  const teacher = state.viewAs === "admin";
  const [filter, setFilter] = useState<Filter>("all");
  const studentOpenedComposer = !teacher && (preview === "denied" || !!compose);
  const teacherName = nameOf(TEACHER_ID);

  const posts = preview === "empty" ? [] : state.posts;
  const feed = posts.filter((p) => filter === "all" || p.type === filter).sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  const filterLabel = FILTERS.find(([f]) => f === filter)![1].toLowerCase();

  return (
    <>
      <PreviewBar
        current={{ state: preview }}
        groups={[{ param: "state", label: "State", options: [["", "Default"], ["empty", "No posts"], ["denied", "Student opens new-post link"]] }]}
      />
      <div className="flex max-w-[760px] flex-col gap-4">
        <ScreenHeader id="WF10" title="Posts" kicker={theClass.name} />

        {studentOpenedComposer ? (
          <StateCard kind="denied" title="Only teachers can post here" action={<LinkButton href="/posts" kind="primary">Back to posts</LinkButton>}>
            You can still read every post and download every file. Have something to share with your table? Use your group’s own chat.
          </StateCard>
        ) : (
          <>
            {teacher ? (
              <Composer initialType={isType(compose) ? compose : "announcement"} />
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-xl bg-mint-2 px-4 py-3 text-[15px]">
                <span className="flex-[1_1_240px]">Posts come from {teacherName}. You can read everything and download files.</span>
                <LinkButton href="/posts?compose=announcement" small>＋ New post</LinkButton>
              </div>
            )}

            <div role="group" aria-label="Filter posts" className="flex flex-wrap gap-2">
              {FILTERS.map(([f, label]) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "min-h-11 rounded-full border-[1.5px] px-4 text-[15px] font-bold",
                    filter === f ? "border-ink bg-ink text-white" : "border-[#9aa39f] bg-white text-ink hover:border-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {feed.length === 0 ? (
              <div role="status" className="flex flex-col gap-1.5 rounded-2xl border-[1.5px] border-dashed border-[#9aa39f] bg-white px-6 py-7">
                <b className="text-xl">{posts.length === 0 ? "No posts yet" : `No ${filterLabel} yet`}</b>
                <span className="text-muted">
                  {posts.length > 0
                    ? "Try another filter."
                    : teacher
                      ? "Share a file, meeting, or deadline above. Meetings and deadlines also go on the calendar."
                      : `When ${teacherName} shares files, meetings, or deadlines, they’ll show up here.`}
                </span>
              </div>
            ) : (
              <section aria-label="Feed" className="flex flex-col gap-4">
                {feed.map((p) => (
                  <PostCard key={p.id} post={p} teacherName={teacherName} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
