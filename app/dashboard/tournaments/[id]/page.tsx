import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import BackLink from "@/app/components/BackLink";
import ParticipantsManager from "@/app/components/dashboard/ParticipantsManager";
import OfficialTournamentOverview from "@/app/components/dashboard/OfficialTournamentOverview";
import TournamentStatusControl from "@/app/dashboard/TournamentStatusControl";

export default async function TournamentDetailDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select(
      "id, name, type, format, status, start_date, end_date, max_participants, registration_deadline"
    )
    .eq("id", id)
    .single();

  if (!tournament) notFound();

  return (
    <div>
      <BackLink href="/dashboard/tournaments" label="Back to Tournaments" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            {tournament.name}
          </h1>
          <p className="mt-1 text-sm capitalize text-muted">
            {tournament.type} · {tournament.format} · {tournament.status}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/tournaments/${id}/edit`} className="btn-outline text-sm">
            Edit Details
          </Link>
          {tournament.type === "internal" && (
            <>
              <Link href={`/dashboard/tournaments/${id}/fixtures`} className="btn-outline text-sm">
                Fixtures
              </Link>
              <Link href={`/dashboard/tournaments/${id}/bracket`} className="btn-outline text-sm">
                Bracket / Standings
              </Link>
            </>
          )}
          <TournamentStatusControl tournamentId={tournament.id} currentStatus={tournament.status} />
        </div>
      </div>

      <div className="mt-8">
        {tournament.type === "internal" ? (
          <InternalParticipants tournamentId={id} maxParticipants={tournament.max_participants} />
        ) : (
          <OfficialTournamentOverview tournamentId={id} />
        )}
      </div>
    </div>
  );
}

async function InternalParticipants({
  tournamentId,
  maxParticipants,
}: {
  tournamentId: string;
  maxParticipants: number | null;
}) {
  const supabase = await createClient();

  const { data: participants } = await supabase
    .from("tournament_participants")
    .select(
      "id, points, status, matches_played, wins, draws, losses, goals_for, goals_against, player_details(efootball_username)"
    )
    .eq("tournament_id", tournamentId);

  const { data: allPlayers } = await supabase
    .from("player_details")
    .select("id, efootball_username")
    .order("efootball_username");

  return (
    <ParticipantsManager
      tournamentId={tournamentId}
      participants={(participants ?? []) as any}
      allPlayers={allPlayers ?? []}
      maxParticipants={maxParticipants}
    />
  );
}