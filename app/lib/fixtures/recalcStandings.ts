import { SupabaseClient } from "@supabase/supabase-js";

type Stats = {
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
};

export async function recalcStandings(supabase: SupabaseClient, tournamentId: string) {
  const { data: participants } = await supabase
    .from("tournament_participants")
    .select("id, player_id")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (!participants || participants.length === 0) return;

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select("player1_id, player2_id, player1_score, player2_score, status")
    .eq("tournament_id", tournamentId)
    .eq("status", "completed");

  const statsMap: Record<string, Stats> = {};
  for (const p of participants) {
    statsMap[p.player_id] = {
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    };
  }

  for (const m of matches ?? []) {
    if (!m.player1_id || !m.player2_id) continue; // skip BYE matches
    if (m.player1_score === null || m.player2_score === null) continue;

    const s1 = statsMap[m.player1_id];
    const s2 = statsMap[m.player2_id];
    if (!s1 || !s2) continue;

    s1.matches_played++;
    s2.matches_played++;
    s1.goals_for += m.player1_score;
    s1.goals_against += m.player2_score;
    s2.goals_for += m.player2_score;
    s2.goals_against += m.player1_score;

    if (m.player1_score > m.player2_score) {
      s1.wins++;
      s1.points += 3;
      s2.losses++;
    } else if (m.player2_score > m.player1_score) {
      s2.wins++;
      s2.points += 3;
      s1.losses++;
    } else {
      s1.draws++;
      s2.draws++;
      s1.points += 1;
      s2.points += 1;
    }
  }

  await Promise.all(
    participants.map((p: any) =>
      supabase.from("tournament_participants").update(statsMap[p.player_id]).eq("id", p.id)
    )
  );
}
