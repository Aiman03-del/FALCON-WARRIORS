import { redirect } from "next/navigation";

export default async function FixturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  if (tab === "standings") {
    redirect(`/dashboard/tournaments/${id}`);
  }
  if (tab === "bracket") {
    redirect(`/dashboard/tournaments/${id}?tab=bracket`);
  }

  redirect(`/dashboard/tournaments/${id}?tab=fixtures`);
}
