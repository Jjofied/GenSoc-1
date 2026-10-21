import { PlaceholderSection } from "@/components/PlaceholderSection";
import { ScreenHeader } from "@/components/ScreenHeader";
import { classes } from "@/lib/mock-data";

export default function JoinClassPage() {
  const demo = classes[0];
  return (
    <>
      <ScreenHeader id="WF02" title="Join class" who="Student" />
      <PlaceholderSection
        title="Invite code"
        notes={["One input: 6-character code or pasted invite link", "Button: Join", `Try mock code: ${demo.inviteCode}`]}
      />
      <PlaceholderSection
        title="States"
        notes={[
          `Success: ${demo.name} + teacher name + "Go to class"`,
          "Error: That code didn't work. Check with your teacher.",
          "Already joined",
        ]}
      />
    </>
  );
}
