import { JoinClass } from "@/components/screens/JoinClass";
import { readParams, type SearchParams } from "@/lib/params";

export default async function JoinClassPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await readParams(searchParams, ["state"]);
  return <JoinClass preview={state} />;
}
