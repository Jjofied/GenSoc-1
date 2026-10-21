import { AdminDashboard } from "@/components/screens/AdminDashboard";
import { readParams, type SearchParams } from "@/lib/params";

export default async function AdminDashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await readParams(searchParams, ["state"]);
  return <AdminDashboard preview={state} />;
}
