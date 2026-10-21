import { CalendarScreen } from "@/components/screens/CalendarScreen";
import { readParams, type SearchParams } from "@/lib/params";

export default async function CalendarPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await readParams(searchParams, ["state"]);
  return <CalendarScreen key={state} preview={state} />;
}
