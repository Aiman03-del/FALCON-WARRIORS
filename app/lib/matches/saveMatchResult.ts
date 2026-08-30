import { recalcStandings } from "@/app/lib/fixtures/recalcStandings";
import { recalcAllPlayerStats } from "@/app/lib/matches/recalcPlayerStats";

export async function saveMatchResult(
  supabase: any,
  params: {
    matchId: string;
    tournamentId: string;
    player1Id: string | null;
    player2Id: string | null;
    score1: number;
    score2: number;
    format: string;
  }
) {
  const { matchId, tournamentId, player1Id, player2Id, score1, score2, format } = params;
  const winnerId = score1 > score2 ? player1Id : score2 > score1 ? player2Id : null;

  const { error: matchError } = await supabase
    .from("tournament_matches")
    .update({
      player1_score: score1,
      player2_score: score2,
      winner_id: winnerId,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (matchError) throw new Error(matchError.message);

  await recalcStandings(supabase, tournamentId);
  await recalcAllPlayerStats(supabase);

  if (format === "league") {
    const { count } = await supabase
      .from("tournament_matches")
      .select("id", { count: "exact", head: true })
      .eq("tournament_id", tournamentId)
      .not("status", "in", "(completed,bye)");

    if (count === 0) {
      await supabase
        .from("tournaments")
        .update({ status: "completed" })
        .eq("id", tournamentId)
        .neq("status", "completed");
    }
  }
}