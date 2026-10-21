import { MockSignIn } from "@/components/MockSignIn";
import { PlaceholderSection } from "@/components/PlaceholderSection";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function SignInPage() {
  return (
    <>
      <ScreenHeader id="WF01" title="Welcome / Sign in" who="Everyone">
        Fair roles. Every project.
      </ScreenHeader>
      <PlaceholderSection
        title="Sign in form"
        notes={["Email, password", "Buttons: Sign in, Create account", "Link: Forgot password", "Error state: wrong password (plain language, no blame)"]}
      >
        <MockSignIn />
      </PlaceholderSection>
      <PlaceholderSection
        title="Privacy note"
        notes={["We never ask for gender. Roles are assigned by rotation, not by who you are."]}
      />
      <PlaceholderSection title="Shared device reminder" notes={["Remember to sign out on a shared device."]} />
    </>
  );
}
