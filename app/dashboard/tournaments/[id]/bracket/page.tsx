import { redirect } from "next/navigation";

export default async function TournamentBracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/tournaments/${id}?tab=bracket`);
}
