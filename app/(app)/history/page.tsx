import { RoleHistoryScreen } from "@/components/screens/RoleHistoryScreen";
import { readParams, type SearchParams } from "@/lib/params";

export default async function RoleHistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await readParams(searchParams, ["state"]);
  return <RoleHistoryScreen preview={state} />;
}
