"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PreviewBar } from "@/components/PreviewBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Banner } from "@/components/ui/Banner";
import { Kicker } from "@/components/ui/Bits";
import { Block, BlockGrid } from "@/components/ui/Block";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { StateCard } from "@/components/ui/StateCard";
import { useDemo } from "@/lib/demo-store";
import { downloadSampleFile } from "@/lib/download";
import { agoLabel, dayLabel, TODAY_TIME, whenLabel } from "@/lib/format";
import { POST_TYPE } from "@/lib/labels";
import { TEACHER_ID } from "@/lib/mock-data";
import { nameOf, theClass } from "@/lib/selectors";
import type { Post, PostType } from "@/lib/types";

const FILTERS = [["all", "All"], ["file", "Files & modules"], ["meeting", "Meetings"], ["deadline", "Deadlines"]] as const;
type Filter = (typeof FILTERS)[number][0];

const TYPES = [["announcement", "Announcement"], ["file", "File"], ["meeting", "Meeting"], ["deadline", "Deadline"]] as const;
const isType = (v: string): v is PostType => TYPES.some(([t]) => t === v);

function formatSize(bytes: number) {
  return bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

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
    toast(dateTime ? `Posted. Added to the calendar on ${dayLabel(dateTime)}.` : "Posted to class.");
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setBody("");
    setFile(null);
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3">
      <Segmented label="Post type" options={TYPES} value={type} onChange={setType} className="self-start" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} autoFocus={initialType !== "announcement"} />
        {dated && (
          <>
            <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
            <Field label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} hint={type === "deadline" ? "Blank = 11:59 PM" : "Blank = 9 AM"} />
          </>
        )}
      </div>
      {type === "meeting" && <Field label="Room or link" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 304 · meet link" />}
      <Field label="Description" multiline value={body} onChange={(e) => setBody(e.target.value)} />
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-md border-[1.5px] border-dashed border-line bg-paper px-3 py-4 text-center text-sm has-focus-visible:outline-2 has-focus-visible:outline-ink">
        <input
          type="file"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setFile(f ? { name: f.name, size: formatSize(f.size) } : null);
          }}
        />
        <span className="font-semibold">{file ? `▤ ${file.name} · ${file.size}` : "File upload · drop or browse"}</span>
        <span className="text-xs text-muted">{file ? "Click to change" : type === "file" ? "Required for a file post" : "Optional"}</span>
      </label>
      {errors.file && <p className="text-xs font-semibold">! {errors.file}</p>}
      <p className="text-xs text-muted">▦ Meetings and deadlines are added to the calendar automatically.</p>
      <Button kind="primary" type="submit" className="self-start">Post to class</Button>
    </form>
  );
}

function PostCard({ post }: { post: Post }) {
  const t = POST_TYPE[post.type];
  return (
    <article className="flex gap-3 border-b border-line-soft py-3 last:border-0">
      <span aria-hidden className="grid h-9 w-9 flex-none place-items-center rounded border-[1.5px] border-ink bg-fill-soft text-base">
        {t.glyph}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <Kicker>{t.label}</Kicker>
          <span className="text-xs text-muted">{agoLabel(post.postedAt)}</span>
        </div>
        <h3 className="font-bold">{post.title}</h3>
        {post.body && <p className="text-sm text-ink-2">{post.body}</p>}
        {post.dateTime && (
          <p className="text-xs">
            {whenLabel(post.dateTime)}
            {post.location && ` · ${post.location}`} ·{" "}
            <Link href="/calendar" className="font-semibold text-accent hover:text-accent-strong">✓ on calendar</Link>
          </p>
        )}
        {post.attachment && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded border-[1.2px] border-line px-2 py-1 font-mono">
              ▤ {post.attachment.name} · {post.attachment.size}
            </span>
            <Button small onClick={() => downloadSampleFile(post.attachment!.name)} aria-label={`Download ${post.attachment.name}`}>
              Download
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

/** WF10 · Posts: files, meetings, deadlines. Teachers post; students read and download. */
export function PostsScreen({ preview, compose }: { preview: string; compose: string }) {
  const { state } = useDemo();
  const teacher = state.viewAs === "admin";
  const [filter, setFilter] = useState<Filter>("all");
  const studentOpenedComposer = !teacher && (preview === "denied" || !!compose);

  const feed = (preview === "empty" ? [] : state.posts)
    .filter((p) => filter === "all" || p.type === filter)
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  return (
    <>
      <PreviewBar
        current={{ state: preview }}
        groups={[{ param: "state", label: "State", options: [["", "Default"], ["empty", "No posts"], ["denied", "Student opens new-post link"]] }]}
      />
      <ScreenHeader id="WF10" title="Posts" sub={theClass.name} />

      {studentOpenedComposer ? (
        <StateCard kind="denied" title="Only teachers can post" action={<LinkButton href="/posts" kind="primary">Back to posts</LinkButton>}>
          You can still read and download everything.
        </StateCard>
      ) : (
        <BlockGrid>
          {teacher ? (
            <Block span={12} strong label="New post">
              <Composer initialType={isType(compose) ? compose : "announcement"} />
            </Block>
          ) : (
            <Block span={12} bare>
              <Banner>Posts come from {nameOf(TEACHER_ID)}. You can read everything and download files.</Banner>
            </Block>
          )}

          <Block span={12} bare>
            <Segmented label="Filter posts" options={FILTERS} value={filter} onChange={setFilter} className="self-start" />
          </Block>

          <Block span={12} label={`Feed${filter === "all" ? "" : ` · ${FILTERS.find(([f]) => f === filter)![1]}`}`} go={{ href: "/calendar", label: "Calendar" }}>
            {feed.length === 0 ? (
              <StateCard kind="empty" title="No posts yet">
                Files, meetings and deadlines will show up here.
              </StateCard>
            ) : (
              <div>
                {feed.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </Block>
        </BlockGrid>
      )}
    </>
  );
}
