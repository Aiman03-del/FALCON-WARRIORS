import { countTeamsInRound } from "@/app/lib/utils/roundNames";

export type BracketMatchRow = {
  id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  winner_id?: string | null;
  status: string;
  stage?: string | null;
  is_third_place?: boolean | null;
  player1?: unknown;
  player2?: unknown;
};

function winnerIdOf(m: BracketMatchRow): string | null {
  if (m.winner_id) return m.winner_id;
  if (m.status === "bye") return m.player1_id;
  if (m.status !== "completed") return null;
  if (m.player1_score === null || m.player2_score === null) return null;
  if (m.player1_score > m.player2_score) return m.player1_id;
  if (m.player2_score > m.player1_score) return m.player2_id;
  return null;
}

function roundsNeeded(firstRoundMatchCount: number): number {
  let rounds = 1;
  let matches = firstRoundMatchCount;
  while (matches > 1) {
    matches = Math.ceil(matches / 2);
    rounds++;
  }
  return rounds;
}

/** Expand partial knockout data into a full bracket through the final (TBD slots included). */
export function buildFullKnockoutBracket(matches: BracketMatchRow[]): BracketMatchRow[] {
  const real = matches
    .filter((m) => !m.is_third_place)
    .slice()
    .sort((a, b) => a.round - b.round || a.match_order - b.match_order);

  if (real.length === 0) return [];

  const byRound = new Map<number, BracketMatchRow[]>();
  for (const m of real) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }
  for (const list of byRound.values()) {
    list.sort((a, b) => a.match_order - b.match_order);
  }

  const firstRoundNum = Math.min(...byRound.keys());
  const round1 = byRound.get(firstRoundNum)!;
  const totalRoundCount = roundsNeeded(round1.length);
  const lastRoundNum = firstRoundNum + totalRoundCount - 1;

  const filledByRound = new Map<number, BracketMatchRow[]>();
  filledByRound.set(firstRoundNum, round1);

  for (let round = firstRoundNum + 1; round <= lastRoundNum; round++) {
    const prev = filledByRound.get(round - 1) ?? [];
    const existing = byRound.get(round) ?? [];
    const matchCount = Math.ceil(prev.length / 2);
    const roundMatches: BracketMatchRow[] = [];

    for (let order = 1; order <= matchCount; order++) {
      const dbMatch = existing.find((m) => m.match_order === order);
      if (dbMatch) {
        roundMatches.push(dbMatch);
        continue;
      }

      const feeder1 = prev[(order - 1) * 2];
      const feeder2 = prev[(order - 1) * 2 + 1];
      const p1Id = feeder1 ? winnerIdOf(feeder1) : null;
      const p2Id = feeder2 ? winnerIdOf(feeder2) : null;

      roundMatches.push({
        id: `preview-${round}-${order}`,
        round,
        match_order: order,
        player1_id: p1Id,
        player2_id: p2Id,
        player1_score: null,
        player2_score: null,
        status: p1Id && !p2Id ? "bye" : "scheduled",
      });
    }

    filledByRound.set(round, roundMatches);
  }

  return Array.from(filledByRound.entries())
    .sort(([a], [b]) => a - b)
    .flatMap(([, rows]) => rows);
}

/** League / group-stage matches shown as round columns in the bracket UI. */
export function buildLeagueBracketMatches(matches: BracketMatchRow[]): BracketMatchRow[] {
  return matches
    .filter((m) => m.stage !== "knockout" && !m.is_third_place)
    .slice()
    .sort((a, b) => a.round - b.round || a.match_order - b.match_order);
}

export function bracketModeForFormat(format: string, matches: BracketMatchRow[]): "knockout" | "league" {
  const knockoutCount = matches.filter((m) => m.stage === "knockout" || m.stage == null).length;
  if (format === "knockout" || knockoutCount > 0) return "knockout";
  return "league";
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/** Empty knockout tree for N qualifiers — shown before the knockout stage is drawn. */
export function buildProjectedKnockoutBracket(teamCount: number, startRound = 1): BracketMatchRow[] {
  if (teamCount < 2) return [];

  const bracketSize = nextPowerOfTwo(teamCount);
  let matchesInRound = bracketSize / 2;
  let round = startRound;
  const result: BracketMatchRow[] = [];

  while (matchesInRound >= 1) {
    for (let order = 1; order <= matchesInRound; order++) {
      result.push({
        id: `projected-${round}-${order}`,
        round,
        match_order: order,
        player1_id: null,
        player2_id: null,
        player1_score: null,
        player2_score: null,
        status: "scheduled",
        stage: "knockout",
      });
    }
    if (matchesInRound === 1) break;
    matchesInRound = Math.ceil(matchesInRound / 2);
    round++;
  }

  return result;
}
