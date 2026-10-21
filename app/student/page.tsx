import { GroupStatusLabel } from "@/components/GroupStatusLabel";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { RoleChip } from "@/components/RoleChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  classes,
  currentProject,
  getAssignment,
  getGroupFor,
  getRole,
  getUser,
  memberIds,
  mockCurrentUser,
  posts,
} from "@/lib/mock-data";

export default function StudentDashboardPage() {
  const me = mockCurrentUser.student;
  const group = getGroupFor(me.id);
  const myRole = getRole(getAssignment(me.id, currentProject.id)?.roleId ?? "");

  return (
    <>
      <ScreenHeader id="WF03" title="Student dashboard" who="Student" />
      <PlaceholderSection title="Class switcher" notes={[classes[0].name]} />

      <PlaceholderSection title="My group" notes={group ? undefined : ["Empty state: You're not in a group yet + \"Find a table\""]}>
        {group && (
          <>
            <p className="mb-2 flex items-center gap-2 text-sm">
              {group.name} <GroupStatusLabel status={group.status} />
            </p>
            <ul className="space-y-1 text-sm">
              {memberIds(group).map((id) => {
                const role = getRole(getAssignment(id, currentProject.id)?.roleId ?? "");
                return (
                  <li key={id} className="flex items-center gap-2">
                    {getUser(id)?.name} {role && <RoleChip role={role} />}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </PlaceholderSection>

      <PlaceholderSection title="My current role" notes={myRole ? [myRole.focus] : undefined}>
        {myRole && <RoleChip role={myRole} />}
      </PlaceholderSection>
      <PlaceholderSection title="Next deadline · Next meeting" notes={["Pulled from calendar"]} />
      <PlaceholderSection title="Latest posts" notes={posts.filter((p) => p.type === "file").map((p) => p.title)} />
    </>
  );
}
