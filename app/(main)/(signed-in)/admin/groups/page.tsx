import { GroupSetup } from "@/components/screens/GroupSetup";
import { readParams, type SearchParams } from "@/lib/params";

export default async function GroupSetupPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await readParams(searchParams, ["state"]);
  return <GroupSetup key={state} preview={state} />;
}
