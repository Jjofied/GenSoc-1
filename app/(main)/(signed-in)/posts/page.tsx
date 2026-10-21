import { PostsScreen } from "@/components/screens/PostsScreen";
import { readParams, type SearchParams } from "@/lib/params";

export default async function PostsPage({ searchParams }: { searchParams: SearchParams }) {
  const { state, compose } = await readParams(searchParams, ["state", "compose"]);
  return <PostsScreen key={`${state}-${compose}`} preview={state} compose={compose} />;
}
