import type { BracketMatchRow } from "./buildFullKnockoutBracket";

export type Tie = {
  round: number;
  match_order: number;
  legs: BracketMatchRow[]; // 1 leg = normal, 2 legs = home/away pair
};

export function groupIntoTies(matches: BracketMatchRow[]): Tie[] {
  const map = new Map<string, BracketMatchRow[]>();
  for (const m of matches) {
    const key = `${m.round}-${m.match_order}`;
    const list = map.get(key) ?? [];
    list.push(m);
    map.set(key, list);
  }
  return Array.from(map.values()).map((legs) => {
    const sorted = legs.slice().sort((a, b) => (a.leg ?? 1) - (b.leg ?? 1));
    return { round: sorted[0].round, match_order: sorted[0].match_order, legs: sorted };
  });
}

function singleWinnerId(m: BracketMatchRow): string | null {
  if (m.winner_id) return m.winner_id;
  if (m.status === "bye") return m.player1_id;
  if (m.status !== "completed") return null;
  if (m.player1_score === null || m.player2_score === null) return null;
  if (m.player1_score > m.player2_score) return m.player1_id;
  if (m.player2_score > m.player1_score) return m.player2_id;
  return null;
}

/** Winner of the tie: if 1 leg, normal result; if 2 legs, aggregate + away-goals rule */
export function tieWinnerId(tie: Tie): string | null {
  const { legs } = tie;
  if (legs.length === 1) return singleWinnerId(legs[0]);

  const [leg1, leg2] = legs; // leg1: A(home) vs B(away) | leg2: B(home) vs A(away)
  if (leg1.status !== "completed" || leg2.status !== "completed") return null;
  if (
    leg1.player1_score == null || leg1.player2_score == null ||
    leg2.player1_score == null || leg2.player2_score == null
  ) return null;

  const teamA = leg1.player1_id;
  const teamB = leg1.player2_id;
  if (!teamA || !teamB) return null;

  const aggA = leg1.player1_score + leg2.player2_score;
  const aggB = leg1.player2_score + leg2.player1_score;
  if (aggA > aggB) return teamA;
  if (aggB > aggA) return teamB;

  // aggregate tied — away goals rule
  const awayGoalsA = leg2.player1_score; // A is away in leg2
  const awayGoalsB = leg1.player2_score; // B is away in leg1
  if (awayGoalsA > awayGoalsB) return teamA;
  if (awayGoalsB > awayGoalsA) return teamB;

  return null; // still tied — admin must manually enter the penalty result
}

export function tieIsDone(tie: Tie): boolean {
  return tie.legs.every((m) => m.status === "completed" || m.status === "bye");
}

/** String shown in the UI for "3 - 2 (aggregate)" */
export function aggregateLabel(tie: Tie): string | null {
  if (tie.legs.length === 1) return null;
  const [leg1, leg2] = tie.legs;
  if (leg1.player1_score == null || leg2.player2_score == null) return null;
  if (leg1.player2_score == null || leg2.player1_score == null) return null;
  const aggA = leg1.player1_score + leg2.player2_score;
  const aggB = leg1.player2_score + leg2.player1_score;
  return `${aggA} - ${aggB} (aggregate)`;
}