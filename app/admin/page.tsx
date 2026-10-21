import { AdminOnly } from "@/components/AdminOnly";
import { GroupStatusLabel } from "@/components/GroupStatusLabel";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { ScreenHeader } from "@/components/ScreenHeader";
import { classes, currentProject, groups, memberIds } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const alerts = groups.filter((g) => g.status === "not-full-started");

  return (
    <>
      <ScreenHeader id="WF04" title="Admin dashboard" who="Admin" />
      <AdminOnly>
        <PlaceholderSection title="Class switcher + Create class" notes={[classes[0].name]} />
        <PlaceholderSection title="Alerts" notes={alerts.length ? undefined : ["No alerts"]}>
          <ul className="space-y-1 text-sm">
            {alerts.map((g) => (
              <li key={g.id} className="flex items-center gap-2">
                {g.name} <GroupStatusLabel status={g.status} /> → action: Fix group
              </li>
            ))}
          </ul>
        </PlaceholderSection>
        <PlaceholderSection title="Groups overview">
          <ul className="space-y-1 text-sm">
            {groups.map((g) => (
              <li key={g.id} className="flex items-center gap-2">
                {g.name} · {memberIds(g).length}/{g.seats.length} <GroupStatusLabel status={g.status} />
              </li>
            ))}
          </ul>
        </PlaceholderSection>
        <PlaceholderSection title="Rotation status" notes={[`Roles rotated for ${currentProject.name}`]} />
        <PlaceholderSection title="Role balance" notes={["How many students have done each role"]} />
        <PlaceholderSection title="Quick actions" notes={["Post file", "Schedule meeting", "Add deadline", "Start new project"]} />
      </AdminOnly>
    </>
  );
}
