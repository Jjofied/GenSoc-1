import type { Post } from "@/lib/types";
import { POST_TYPE } from "@/lib/labels";
import { agoLabel } from "@/lib/format";

/** Compact post row, for dashboard cards: type tile, title, attachment + age. */
export function PostLine({ post }: { post: Post }) {
  const t = POST_TYPE[post.type];
  return (
    <span className="flex min-w-0 items-start gap-3">
      <span aria-hidden style={{ background: t.bg, color: t.fg, border: t.border }} className="grid h-8 w-8 flex-none place-items-center rounded-lg text-[15px]">
        {t.glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className="sr-only">{t.label}: </span>
        <b className="block truncate">{post.title}</b>
        <span className="block truncate text-[15px] text-muted">
          {post.attachment ? `${post.attachment.name} · ` : ""}
          {agoLabel(post.postedAt)}
        </span>
      </span>
    </span>
  );
}
