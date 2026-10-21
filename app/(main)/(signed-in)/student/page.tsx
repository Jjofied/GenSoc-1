import { StudentDashboard } from "@/components/screens/StudentDashboard";
import { readParams, type SearchParams } from "@/lib/params";

export default async function StudentDashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await readParams(searchParams, ["state"]);
  return <StudentDashboard preview={state} />;
}
