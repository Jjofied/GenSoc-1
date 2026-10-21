import { GroupStatusLabel } from "@/components/GroupStatusLabel";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { RoleChip } from "@/components/RoleChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { currentProject, getAssignment, getRole, getUser, groups } from "@/lib/mock-data";

export default function RoundTablePage() {
  return (
    <>
      <ScreenHeader id="WF07" title="Round table" who="Student (everyone can see all groups)" />
      {currentProject.status === "active" && (
        <p className="mb-4 rounded border border-stone-300 bg-white p-3 text-sm">
          Group changes are closed. Ask your teacher to move you.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <PlaceholderSection key={g.id} title={g.name}>
            <GroupStatusLabel status={g.status} />
            <ul className="mt-2 space-y-1 text-sm">
              {g.seats.map((seat) => {
                const role = seat.studentId && getRole(getAssignment(seat.studentId, currentProject.id)?.roleId ?? "");
                return (
                  <li key={seat.index} className="flex items-center gap-2">
                    {seat.studentId ? (
                      <>
                        {getUser(seat.studentId)?.name} {role && <RoleChip role={role} />}
                      </>
                    ) : (
                      <span className="text-stone-500">Empty seat – Sit here</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </PlaceholderSection>
        ))}
      </div>
      <PlaceholderSection title="Actions" notes={["Create group, Join, Leave, Switch", "Confirmation modal for switching"]} />
    </>
  );
}
