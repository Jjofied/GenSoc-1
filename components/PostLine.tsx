import type { Post } from "@/lib/types";
import { POST_TYPE } from "@/lib/labels";
import { agoLabel } from "@/lib/format";

/** Compact one-line post, for dashboard cards. */
export function PostLine({ post }: { post: Post }) {
  const t = POST_TYPE[post.type];
  return (
    <span className="flex min-w-0 items-center gap-2.5 text-sm">
      <span aria-hidden className="grid h-7 w-7 flex-none place-items-center rounded border-[1.5px] border-line bg-fill-soft">
        {t.glyph}
      </span>
      <span className="min-w-0 flex-1 truncate">
        <span className="sr-only">{t.label}: </span>
        {post.title}
        {post.attachment && <span className="text-muted"> · {post.attachment.name}</span>}
      </span>
      <span className="flex-none text-xs text-muted">{agoLabel(post.postedAt)}</span>
    </span>
  );
}
