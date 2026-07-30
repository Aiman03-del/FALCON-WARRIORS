import { redirect } from "next/navigation";

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/dashboard/tournaments/${slug}?tab=edit`);
}
