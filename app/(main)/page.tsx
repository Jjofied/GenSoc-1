import { SignIn } from "@/components/screens/SignIn";
import { readParams, type SearchParams } from "@/lib/params";

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const { state, signedout } = await readParams(searchParams, ["state", "signedout"]);
  return <SignIn preview={state} signedOut={signedout === "1"} />;
}
