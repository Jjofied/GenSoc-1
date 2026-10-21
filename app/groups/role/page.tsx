import { PlaceholderSection } from "@/components/PlaceholderSection";
import { RoleChip } from "@/components/RoleChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { currentProject, getAssignment, getRole, mockCurrentUser, projects, roles } from "@/lib/mock-data";

export default function PickRolePage() {
  const me = mockCurrentUser.student;
  const previous = projects.find((p) => p.number === currentProject.number - 1);
  const now = getRole(getAssignment(me.id, currentProject.id)?.roleId ?? "");
  const last = previous && getRole(getAssignment(me.id, previous.id)?.roleId ?? "");

  return (
    <>
      <ScreenHeader id="WF08" title="Pick role" who="Student" />
      <PlaceholderSection
        title="Project 1: role cards"
        notes={["Icon, name, one-line description, who has taken it", "Shared roles show \"2 seats\"", "Select + confirm"]}
      >
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <RoleChip key={r.id} role={r} />
          ))}
        </div>
      </PlaceholderSection>
      <PlaceholderSection
        title="Project 2+: rotated role notice"
        notes={[
          `Your role this project: ${now?.name ?? "—"} (last project: ${last?.name ?? "—"})`,
          "From Project 2, roles rotate automatically. You won't get the same role twice in a row.",
        ]}
      />
    </>
  );
}
