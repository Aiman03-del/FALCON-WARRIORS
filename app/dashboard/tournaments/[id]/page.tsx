import BackLink from "@/app/components/BackLink";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";
import TournamentStatusControl from "../../TournamentStatusControl";
import OfficialTournamentOverview from "@/app/components/dashboard/OfficialTournamentOverview";
import ParticipantsManager from "@/app/components/dashboard/ParticipantsManager";
export default async function ManageTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, name, type, format, status, start_date, end_date, max_participants")
    .eq("id", id)
    .single();

  if (!tournament) notFound();

  return (
    <div>
      <BackLink href="/dashboard/tournaments" label="Back to Tournaments" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            {tournament.name}
          </h1>
          <p className="mt-1 text-sm text-muted capitalize">
            {tournament.type} · {tournament.format}
          </p>
        </div>
        <TournamentStatusControl tournamentId={tournament.id} currentStatus={tournament.status} />
      </div>

      {tournament.type === "official" ? (
        <div className="mt-6">
          <OfficialTournamentOverview tournamentId={tournament.id} />
        </div>
      ) : (
        <InternalTournamentSection tournamentId={tournament.id} maxParticipants={tournament.max_participants} />
      )}
    </div>
  );
}

async function InternalTournamentSection({
  tournamentId,
  maxParticipants,
}: {
  tournamentId: string;
  maxParticipants: number | null;
}) {
  const supabase = await createClient();

  const { data: participants } = await supabase
    .from("tournament_participants")
    .select("id, points, rank, status, matches_played, wins, draws, losses, goals_for, goals_against, player_details(efootball_username)")
    .eq("tournament_id", tournamentId);

  const { data: allPlayers } = await supabase
    .from("player_details")
    .select("id, efootball_username")
    .order("efootball_username");

  return (
    <ParticipantsManager
      tournamentId={tournamentId}
      participants={participants ?? []}
      allPlayers={allPlayers ?? []}
      maxParticipants={maxParticipants}
    />
  );
}