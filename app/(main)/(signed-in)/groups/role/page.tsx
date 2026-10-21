import { PickRole } from "@/components/screens/PickRole";
import { readParams, type SearchParams } from "@/lib/params";

export default async function PickRolePage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await readParams(searchParams, ["state"]);
  return <PickRole key={state} preview={state} />;
}
