export type StandingStats = {
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
};

type MatchRow = {
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
  stage?: string | null;
};

export function emptyStandingStats(): StandingStats {
  return {
    matches_played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    points: 0,
  };
}

/**
 * Derive standings stats from completed matches.
 * options.includeKnockout — in a pure knockout format, all matches belong to the "knockout" stage,
 * so these matches must also be counted. But in hybrid formats such as group_knockout / league_playoff,
 * counting knockout matches in the group/league standings is incorrect — in that case,
 * this should remain false (the default).
 */
export function computeStandingsFromMatches(
  participantIds: string[],
  matches: MatchRow[],
  options?: { includeKnockout?: boolean }
): Record<string, StandingStats> {
  const includeKnockout = options?.includeKnockout ?? false;

  const statsMap: Record<string, StandingStats> = {};
  for (const id of participantIds) {
    statsMap[id] = emptyStandingStats();
  }

  for (const m of matches) {
    if (m.status !== "completed") continue;
    if (!m.player1_id || !m.player2_id) continue;
    if (m.player1_score === null || m.player2_score === null) continue;
    if (m.stage === "knockout" && !includeKnockout) continue;

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

  return statsMap;
}