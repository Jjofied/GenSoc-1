import { ForView } from "@/components/ForView";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { ScreenHeader } from "@/components/ScreenHeader";
import { posts } from "@/lib/mock-data";

const TYPE_LABEL = { file: "File / module", meeting: "Meeting", deadline: "Deadline" } as const;

export default function PostsPage() {
  return (
    <>
      <ScreenHeader id="WF10" title="Posts: files, meetings, deadlines" who="Admin posts · Student views" />
      <ForView type="admin">
        <PlaceholderSection
          title="New post composer"
          notes={["Type selector, title, description, file upload, date/time", "Meetings + deadlines auto-add to calendar"]}
        />
      </ForView>
      <ForView type="student">
        <PlaceholderSection title="View-only" notes={["Students can view and download. Denied state if they open the composer."]} />
      </ForView>
      <PlaceholderSection title="Feed" notes={["Filter tabs: All, Files/Modules, Meetings, Deadlines"]}>
        <ul className="space-y-1 text-sm">
          {posts.map((p) => (
            <li key={p.id}>
              {TYPE_LABEL[p.type]} · {p.title}
              {p.attachment && ` · ${p.attachment}`}
            </li>
          ))}
        </ul>
      </PlaceholderSection>
    </>
  );
}
