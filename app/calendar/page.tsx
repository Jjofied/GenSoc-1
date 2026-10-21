import { ForView } from "@/components/ForView";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { ScreenHeader } from "@/components/ScreenHeader";
import { calendarEvents } from "@/lib/mock-data";

const TYPE_LABEL = { meeting: "Meeting", deadline: "Deadline", "project-start": "Project start" } as const;

export default function CalendarPage() {
  const events = [...calendarEvents].sort((a, b) => a.start.localeCompare(b.start));
  return (
    <>
      <ScreenHeader id="WF09" title="Calendar" who="Everyone" />
      <ForView type="admin">
        <PlaceholderSection title="+ Add event" notes={["Admin only"]} />
      </ForView>
      <PlaceholderSection title="Month / week view" notes={["Legend: Meeting, Deadline, Project start (rotation day)", "Empty state for a quiet month"]}>
        <ul className="space-y-1 text-sm">
          {events.map((e) => (
            <li key={e.id}>
              <span className="font-mono text-xs text-stone-500">{e.start.slice(0, 10)}</span> · {TYPE_LABEL[e.type]} · {e.title}
              {e.location && ` · ${e.location}`}
            </li>
          ))}
        </ul>
      </PlaceholderSection>
      <PlaceholderSection title="Event detail panel" notes={["Title, date/time, room or link, attached files"]} />
    </>
  );
}
