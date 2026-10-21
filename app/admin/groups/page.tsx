import { AdminOnly } from "@/components/AdminOnly";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { RoleChip } from "@/components/RoleChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { groups, roles } from "@/lib/mock-data";

export default function GroupSetupPage() {
  return (
    <>
      <ScreenHeader id="WF06" title="Group setup + role editor" who="Admin" />
      <AdminOnly>
        <PlaceholderSection
          title="Round table"
          notes={[`Number of groups: ${groups.length}`, `Seats per group: ${groups[0].seats.length}`, "Live preview of tables with empty seats"]}
        />
        <PlaceholderSection title="Roles" notes={["Add, rename, remove", "Toggle: Allow two people to share a role (auto-on when seats > roles)"]}>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <RoleChip key={r.id} role={r} />
            ))}
          </div>
        </PlaceholderSection>
        <PlaceholderSection title="Rotation" notes={["Roles auto-rotate each new project. No repeats back-to-back."]} />
        <PlaceholderSection title="Error state" notes={["Seats fewer than roles → plain-language fix suggestion"]} />
      </AdminOnly>
    </>
  );
}
