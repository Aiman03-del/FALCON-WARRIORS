import { notFound } from "next/navigation";
import MatchResultForm from "@/app/components/dashboard/MatchResultForm";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";

export default async function ManageMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, opponent_name, competition, match_date, status, score_home, score_away, match_type, tournament_id, round_stage, player1_id, player2_id, player1:player1_id(efootball_username), player2:player2_id(efootball_username)"
    )
    .eq("id", id)
    .single();

  if (!match) notFound();

  let tournamentSquad: { id: string; efootball_username: string }[] | null = null;

  if (match.tournament_id) {
    const { data: squadRows } = await supabase
      .from("tournament_squad")
      .select("player_details(id, efootball_username)")
      .eq("tournament_id", match.tournament_id);

    tournamentSquad = (squadRows ?? [])
      .map((row: any) => (Array.isArray(row.player_details) ? row.player_details[0] : row.player_details))
      .filter(Boolean);
  }

  const { data: players } = await supabase
    .from("player_details")
    .select("id, efootball_username")
    .order("efootball_username");

  const p1 = Array.isArray(match.player1) ? match.player1[0] : match.player1;
  const p2 = Array.isArray(match.player2) ? match.player2[0] : match.player2;

  const title =
    match.match_type === "internal"
      ? `${p1?.efootball_username ?? "?"} vs ${p2?.efootball_username ?? "?"}`
      : `vs ${match.opponent_name}${match.round_stage ? ` (${match.round_stage})` : ""}`;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{title}</h1>
      <p className="mt-1 text-sm text-muted">
        {match.competition ?? "Friendly"} · {new Date(match.match_date).toLocaleString()}
      </p>

      <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Squad</h2>
        {tournamentSquad && tournamentSquad.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tournamentSquad.map((player) => (
              <span key={player.id} className="rounded-full border border-border px-3 py-1 text-sm">
                {player.efootball_username}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No squad members found.</p>
        )}
      </div>

      <MatchResultForm
        matchId={match.id}
        matchType={match.match_type}
        currentStatus={match.status}
        currentScoreHome={match.score_home}
        currentScoreAway={match.score_away}
        player1Id={match.player1_id ?? undefined}
        player2Id={match.player2_id ?? undefined}
        player1Name={p1?.efootball_username}
        player2Name={p2?.efootball_username}
        players={players ?? []}
        tournamentSquad={tournamentSquad}
      />
    </div>
  );
}
