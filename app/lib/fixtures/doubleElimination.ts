import type { ParticipantForDraw, MatchDraft } from "./generateFixtures";
import { generateSeededKnockoutRound1, generateKnockoutNextRound } from "./generateFixtures";

export type DEMatchDraft = MatchDraft & { bracket_side: "winners" | "losers" | "grand_final" };

/** Winners Bracket Round 1 — normal seeded knockout draw */
export function generateWinnersRound1(participants: ParticipantForDraw[]): DEMatchDraft[] {
  return generateSeededKnockoutRound1(participants).map((d) => ({ ...d, bracket_side: "winners" as const }));
}

export function generateWinnersNextRound(winners: ParticipantForDraw[], nextRound: number): DEMatchDraft[] {
  return generateKnockoutNextRound(winners, nextRound).map((d) => ({ ...d, bracket_side: "winners" as const }));
}

/**
 * Losers Bracket round — তিনটা কেস:
 *  - pool খালি              -> নতুন WB losers-দের একে অপরের সাথে পেয়ার করা (LB round 1 স্টাইল)
 *  - pool.length === newLosers.length -> "merge" round: pool[i] বনাম newLosers[i]
 *  - newLosers.length === 0 -> "consolidation" round: শুধু pool-কে নিজেদের মধ্যে অর্ধেক করে দেওয়া
 */
export function generateLosersRound(
  pool: ParticipantForDraw[],
  newLosers: ParticipantForDraw[],
  round: number
): DEMatchDraft[] {
  const matches: DEMatchDraft[] = [];
  let order = 1;

  const pairUp = (list: ParticipantForDraw[]) => {
    for (let i = 0; i < list.length; i += 2) {
      const p1 = list[i];
      const p2 = list[i + 1];
      matches.push(
        p2
          ? { round, match_order: order++, player1_id: p1.id, player2_id: p2.id, status: "scheduled", bracket_side: "losers" }
          : { round, match_order: order++, player1_id: p1.id, player2_id: null, status: "bye", bracket_side: "losers" }
      );
    }
  };

  if (pool.length === 0) { pairUp(newLosers); return matches; }
  if (newLosers.length === 0) { pairUp(pool); return matches; }

  const n = Math.min(pool.length, newLosers.length);
  for (let i = 0; i < n; i++) {
    matches.push({ round, match_order: order++, player1_id: pool[i].id, player2_id: newLosers[i].id, status: "scheduled", bracket_side: "losers" });
  }
  // অসম সংখ্যা হলে (non-power-of-2 field) বাকিরা bye পাবে
  for (const p of [...pool.slice(n), ...newLosers.slice(n)]) {
    matches.push({ round, match_order: order++, player1_id: p.id, player2_id: null, status: "bye", bracket_side: "losers" });
  }
  return matches;
}

export function generateGrandFinal(wbChampion: ParticipantForDraw, lbChampion: ParticipantForDraw, round: number): DEMatchDraft {
  return { round, match_order: 1, player1_id: wbChampion.id, player2_id: lbChampion.id, status: "scheduled", bracket_side: "grand_final" };
}

export function generateGrandFinalReset(wbChampion: ParticipantForDraw, lbChampion: ParticipantForDraw, round: number): DEMatchDraft {
  return { round, match_order: 1, player1_id: lbChampion.id, player2_id: wbChampion.id, status: "scheduled", bracket_side: "grand_final" };
}