import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";
import TournamentStatusControl from "../../TournamentStatusControl";
import ParticipantsManager from "@/app/components/dashboard/ParticipantsManager";
import OutlineButton from "@/app/components/OutlineButton";
import BackLink from "@/app/components/BackLink";
import { Pencil } from "lucide-react";
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

  const { data: participants } = await supabase
    .from("tournament_participants")
    .select(
      "id, points, rank, status, matches_played, wins, draws, losses, goals_for, goals_against, player_details(efootball_username)"
    )
    .eq("tournament_id", id);

  const { data: allPlayers } = await supabase
    .from("player_details")
    .select("id, efootball_username")
    .order("efootball_username");

  return (
    <div>
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          {tournament.name}
        </h1>
        <p className="mt-1 text-sm text-muted capitalize">
          {tournament.type} · {tournament.format}
        </p>
        <div className="mt-3">
          <BackLink href="/dashboard/tournaments" label="Back to Tournaments" />
        </div>
      </div>
      <div className="flex items-center gap-3">
      <OutlineButton href={`/dashboard/tournaments/${tournament.id}/edit`} className="flex items-center gap-2 text-sm">
        <Pencil size={14} />
        Edit Details
      </OutlineButton>
      {tournament.type === "internal" && (
        <OutlineButton href={`/dashboard/tournaments/${tournament.id}/fixtures`} className="flex items-center gap-2 text-sm">
          Fixtures
        </OutlineButton>
      )}
      <TournamentStatusControl tournamentId={tournament.id} currentStatus={tournament.status} />
    </div>
  </div>

      {tournament.type === "internal" ? (
        <ParticipantsManager
          tournamentId={tournament.id}
          participants={participants ?? []}
          allPlayers={allPlayers ?? []}
          maxParticipants={tournament.max_participants}
        />
      ) : (
        <div className="mt-6">
          <a
            href={`/dashboard/tournaments/${tournament.id}/matches`}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            Manage Matches
          </a>
        </div>
      )}
    </div>
  );
}