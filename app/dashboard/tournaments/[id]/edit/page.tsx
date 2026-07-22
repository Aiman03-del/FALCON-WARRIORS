import TournamentForm from "@/app/components/dashboard/TournamentForm";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";


export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, name, type, format, double_round, start_date, end_date, max_participants, registration_deadline")
    .eq("id", id)
    .single();

  if (!tournament) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Edit Tournament
      </h1>
      <p className="mt-1 text-sm text-muted">{tournament.name}</p>
      <TournamentForm mode="edit" tournamentId={tournament.id} initial={tournament} />
    </div>
  );
}