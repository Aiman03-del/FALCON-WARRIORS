import { createClient } from "@/app/lib/supabase/server";

export async function getClubRecord() {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("score_home, score_away, status")
    .eq("match_type", "external")
    .eq("status", "completed");

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of matches ?? []) {
    if (m.score_home === null || m.score_away === null) continue;

    goalsFor += m.score_home;
    goalsAgainst += m.score_away;

    if (m.score_home > m.score_away) wins++;
    else if (m.score_home < m.score_away) losses++;
    else draws++;
  }

  const totalMatches = wins + draws + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  return {
    totalMatches,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    winRate,
  };
}
