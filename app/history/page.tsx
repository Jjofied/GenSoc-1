import { ForView } from "@/components/ForView";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { RoleChip } from "@/components/RoleChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { getRole, getUser, mockCurrentUser, projects, roleHistory, roles } from "@/lib/mock-data";
import type { RoleHistory } from "@/lib/types";

function HistoryRow({ history }: { history: RoleHistory }) {
  const done = new Set(history.assignments.map((a) => a.roleId));
  return (
    <tr className="border-t border-stone-200">
      <td className="py-1 pr-3">{getUser(history.studentId)?.name}</td>
      {projects.map((p) => {
        const role = getRole(history.assignments.find((a) => a.projectId === p.id)?.roleId ?? "");
        return <td key={p.id} className="py-1 pr-3">{role ? <RoleChip role={role} /> : "—"}</td>;
      })}
      <td className="py-1 text-stone-600">{done.size}/{roles.length}</td>
    </tr>
  );
}

function HistoryTable({ rows }: { rows: RoleHistory[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-left text-sm">
        <thead>
          <tr>
            <th className="pr-3 font-medium">Student</th>
            {projects.map((p) => (
              <th key={p.id} className="pr-3 font-medium">Project {p.number}</th>
            ))}
            <th className="font-medium">Roles done</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <HistoryRow key={h.studentId} history={h} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RoleHistoryPage() {
  const me = mockCurrentUser.student;
  const myGroupId = roleHistory.find((h) => h.studentId === me.id)?.assignments[0]?.groupId;
  const myGroup = roleHistory.filter((h) => h.assignments[0]?.groupId === myGroupId);

  return (
    <>
      <ScreenHeader id="WF11" title="Role history" who="Everyone (scope by user type)" />
      <ForView type="student">
        <PlaceholderSection title="My timeline + my group's history" notes={["Coverage bar: how many roles each person has done"]}>
          <HistoryTable rows={myGroup} />
        </PlaceholderSection>
      </ForView>
      <ForView type="admin">
        <PlaceholderSection
          title="All students × projects"
          notes={["Filter by group", "Highlight \"never done\" roles", "Override role: modal with new role, required reason, warning if it breaks no-repeat"]}
        >
          <HistoryTable rows={roleHistory} />
        </PlaceholderSection>
      </ForView>
    </>
  );
}
