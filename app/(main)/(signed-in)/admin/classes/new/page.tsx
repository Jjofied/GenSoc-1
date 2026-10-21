import { CreateClass } from "@/components/screens/CreateClass";
import { readParams, type SearchParams } from "@/lib/params";

export default async function CreateClassPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await readParams(searchParams, ["state"]);
  return <CreateClass key={state} preview={state} />;
}
