import { createClient } from "../supabase/client";


export type FormEntry = {
  result: "W" | "D" | "L";
  date: string;
  opponentLabel: string;
  scoreLabel: string;
  matchId?: string;
};

export async function getPlayerForm(playerId: string, limit = 10): Promise<FormEntry[]> {
  const supabase = await createClient();
  const entries: FormEntry[] = [];

  // 1. Internal match (single, player vs player)
  const { data: internalMatches } = await supabase
    .from("matches")
    .select(
      "id, match_date, score_home, score_away, player1_id, player2_id, player1:player1_id(efootball_username), player2:player2_id(efootball_username)"
    )
    .eq("match_type", "internal")
    .eq("status", "completed")
    .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`);

  for (const m of (internalMatches ?? []) as any[]) {
    if (m.score_home === null || m.score_away === null) continue;
    const isP1 = m.player1_id === playerId;
    const myScore = isP1 ? m.score_home : m.score_away;
    const oppScore = isP1 ? m.score_away : m.score_home;
    const opp = isP1 ? m.player2 : m.player1;
    const oppName = Array.isArray(opp) ? opp[0]?.efootball_username : opp?.efootball_username;

    entries.push({
      result: myScore > oppScore ? "W" : myScore < oppScore ? "L" : "D",
      date: m.match_date,
      opponentLabel: oppName ?? "Unknown",
      scoreLabel: `${myScore}-${oppScore}`,
      matchId: m.id,
    });
  }

  // 2. External match (single "played by")
  const { data: squadRows } = await supabase
    .from("match_squad")
    .select("match_id, matches(id, match_date, score_home, score_away, opponent_name, status)")
    .eq("player_id", playerId);

  for (const row of (squadRows ?? []) as any[]) {
    const m = Array.isArray(row.matches) ? row.matches[0] : row.matches;
    if (!m || m.status !== "completed" || m.score_home === null || m.score_away === null) continue;

    entries.push({
      result: m.score_home > m.score_away ? "W" : m.score_home < m.score_away ? "L" : "D",
      date: m.match_date,
      opponentLabel: m.opponent_name ?? "Opponent",
      scoreLabel: `${m.score_home}-${m.score_away}`,
      matchId: m.id,
    });
  }

  // 3. Internal Tournament match
  const { data: tournamentMatches } = await supabase
    .from("tournament_matches")
    .select(
      "id, created_at, player1_id, player2_id, player1_score, player2_score, status, player1:player1_id(efootball_username), player2:player2_id(efootball_username)"
    )
    .eq("status", "completed")
    .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`);

  for (const m of (tournamentMatches ?? []) as any[]) {
    if (m.player1_score === null || m.player2_score === null) continue;
    const isP1 = m.player1_id === playerId;
    const myScore = isP1 ? m.player1_score : m.player2_score;
    const oppScore = isP1 ? m.player2_score : m.player1_score;
    const opp = isP1 ? m.player2 : m.player1;
    const oppName = Array.isArray(opp) ? opp[0]?.efootball_username : opp?.efootball_username;

    entries.push({
      result: myScore > oppScore ? "W" : myScore < oppScore ? "L" : "D",
      date: m.created_at,
      opponentLabel: oppName ?? "Unknown",
      scoreLabel: `${myScore}-${oppScore}`,
    });
  }

  // Sort by date from newest to oldest and limit the result.
  return entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}