import { RoundTables } from "@/components/screens/RoundTables";
import { readParams, type SearchParams } from "@/lib/params";

export default async function RoundTablePage({ searchParams }: { searchParams: SearchParams }) {
  const { state, fix } = await readParams(searchParams, ["state", "fix"]);
  return <RoundTables preview={state} fix={fix} />;
}
