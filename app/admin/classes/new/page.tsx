import { AdminOnly } from "@/components/AdminOnly";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { ScreenHeader } from "@/components/ScreenHeader";
import { classes } from "@/lib/mock-data";

export default function CreateClassPage() {
  const demo = classes[0];
  return (
    <>
      <ScreenHeader id="WF05" title="Create class + invite code" who="Admin" />
      <AdminOnly>
        <PlaceholderSection title="Class details" notes={["Class name, section, term", "Button: Create"]} />
        <PlaceholderSection
          title="Invite code (success state)"
          notes={[`Code: ${demo.inviteCode}`, "Copy, share link, QR code, Regenerate code", `Students joined: ${demo.studentIds.length}`]}
        />
      </AdminOnly>
    </>
  );
}
