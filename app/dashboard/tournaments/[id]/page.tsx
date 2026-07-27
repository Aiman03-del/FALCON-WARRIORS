import BackLink from "@/app/components/BackLink";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
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
        <InternalTournamentSection
          tournamentId={tournament.id}
          format={tournament.format}
          maxParticipants={tournament.max_participants}
        />
      )}
    </div>
  );
}

async function InternalTournamentSection({
  tournamentId,
  format,
  maxParticipants,
}: {
  tournamentId: string;
  format: string;
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
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface-2/70 p-4">
        <div>
          <p className="text-sm font-semibold">Tournament Actions</p>
          <p className="text-xs text-muted">Generate fixtures, manage matches, and review standings.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/tournaments/${tournamentId}/fixtures`}
            className="btn-primary text-sm"
          >
            Go to Fixtures
          </Link>
          <Link
            href={`/dashboard/tournaments/${tournamentId}/bracket`}
            className="btn-outline text-sm"
          >
            {format === "knockout" ? "View Bracket" : "View Standings"}
          </Link>
        </div>
      </div>

      <ParticipantsManager
        tournamentId={tournamentId}
        participants={participants ?? []}
        allPlayers={allPlayers ?? []}
        maxParticipants={maxParticipants}
      />
    </div>
  );
}