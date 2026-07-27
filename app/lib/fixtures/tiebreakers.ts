export type StandingParticipant = {
  player_id: string;
  points: number;
  goals_for: number | null;
  goals_against: number | null;
  manual_rank?: number | null;
  [key: string]: unknown;
};

export type MatchForTiebreak = {
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
};

function goalDiff(p: StandingParticipant): number {
  return (p.goals_for ?? 0) - (p.goals_against ?? 0);
}

// Ranks a set of standings rows using the following order, matching a
// standard league tiebreak chain:
//   1. Points (higher is better)
//   2. Goal difference (higher is better) — NOTE: "net run rate" is not
//      computable with this app's data model (no runs/overs are tracked),
//      so it currently falls back to goal difference too. See tournaments.ts.
//   3. Head-to-head mini-table among just the still-tied participants
//      (points earned only in matches between them, then goal difference
//      only in those matches)
//   4. Admin's manual_rank override (lower number = higher rank). Rows
//      without a manual_rank keep their relative order at the bottom.
export function rankStandings<T extends StandingParticipant>(
  rows: T[],
  matches: MatchForTiebreak[]
): T[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return goalDiff(b) - goalDiff(a);
  });

  const result: T[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (
      j < sorted.length &&
      sorted[j].points === sorted[i].points &&
      goalDiff(sorted[j]) === goalDiff(sorted[i])
    ) {
      j++;
    }
    const block = sorted.slice(i, j);
    result.push(...(block.length > 1 ? breakTie(block, matches) : block));
    i = j;
  }
  return result;
}

function breakTie<T extends StandingParticipant>(block: T[], matches: MatchForTiebreak[]): T[] {
  const ids = new Set(block.map((p) => p.player_id));
  const h2hPoints: Record<string, number> = {};
  const h2hGoalDiff: Record<string, number> = {};
  for (const p of block) {
    h2hPoints[p.player_id] = 0;
    h2hGoalDiff[p.player_id] = 0;
  }

  for (const m of matches) {
    if (!m.player1_id || !m.player2_id) continue;
    if (!ids.has(m.player1_id) || !ids.has(m.player2_id)) continue;
    if (m.status !== "completed" || m.player1_score === null || m.player2_score === null) continue;

    h2hGoalDiff[m.player1_id] += m.player1_score - m.player2_score;
    h2hGoalDiff[m.player2_id] += m.player2_score - m.player1_score;

    if (m.player1_score > m.player2_score) h2hPoints[m.player1_id] += 3;
    else if (m.player2_score > m.player1_score) h2hPoints[m.player2_id] += 3;
    else {
      h2hPoints[m.player1_id] += 1;
      h2hPoints[m.player2_id] += 1;
    }
  }

  return [...block].sort((a, b) => {
    if (h2hPoints[b.player_id] !== h2hPoints[a.player_id]) {
      return h2hPoints[b.player_id] - h2hPoints[a.player_id];
    }
    if (h2hGoalDiff[b.player_id] !== h2hGoalDiff[a.player_id]) {
      return h2hGoalDiff[b.player_id] - h2hGoalDiff[a.player_id];
    }
    const aRank = a.manual_rank ?? Infinity;
    const bRank = b.manual_rank ?? Infinity;
    return aRank - bRank;
  });
}