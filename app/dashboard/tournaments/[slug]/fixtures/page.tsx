import { redirect } from "next/navigation";

export default async function FixturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;

  if (tab === "standings") {
    redirect(`/dashboard/tournaments/${slug}`);
  }
  if (tab === "bracket") {
    redirect(`/dashboard/tournaments/${slug}?tab=bracket`);
  }

  redirect(`/dashboard/tournaments/${slug}?tab=bracket`);
}
