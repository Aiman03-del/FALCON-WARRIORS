import type { ParticipantForDraw, MatchDraft } from "./generateFixtures";

type SwissMatchRow = {
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
};

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

/** Which pairs have already played in this tournament (to avoid rematches) */
export function getPlayedPairs(matches: SwissMatchRow[]): Set<string> {
  const set = new Set<string>();
  for (const m of matches) {
    if (m.player1_id && m.player2_id) set.add(pairKey(m.player1_id, m.player2_id));
  }
  return set;
}

/** Scores used for pairing — a bye is treated as a full win (may differ from the standings table) */
export function computeSwissScores(participantIds: string[], matches: SwissMatchRow[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const id of participantIds) scores[id] = 0;

  for (const m of matches) {
    if (m.status === "bye" && m.player1_id) {
      scores[m.player1_id] = (scores[m.player1_id] ?? 0) + 3;
      continue;
    }
    if (m.status !== "completed" || !m.player1_id || !m.player2_id) continue;
    if (m.player1_score === null || m.player2_score === null) continue;

    if (m.player1_score > m.player2_score) scores[m.player1_id] = (scores[m.player1_id] ?? 0) + 3;
    else if (m.player2_score > m.player1_score) scores[m.player2_id] = (scores[m.player2_id] ?? 0) + 3;
    else {
      scores[m.player1_id] = (scores[m.player1_id] ?? 0) + 1;
      scores[m.player2_id] = (scores[m.player2_id] ?? 0) + 1;
    }
  }
  return scores;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Round 1 — no scores yet, so pair players randomly */
export function generateSwissRound1(participants: ParticipantForDraw[]): MatchDraft[] {
  const shuffled = shuffle(participants);
  const matches: MatchDraft[] = [];
  let order = 1;

  for (let i = 0; i < shuffled.length; i += 2) {
    const p1 = shuffled[i];
    const p2 = shuffled[i + 1];
    matches.push(
      p2
        ? { round: 1, match_order: order++, player1_id: p1.id, player2_id: p2.id, status: "scheduled" }
        : { round: 1, match_order: order++, player1_id: p1.id, player2_id: null, status: "bye" }
    );
  }
  return matches;
}

/**
 * Next round — sort by points and pair players with similar scores, avoiding rematches.
 * Grid method: pair each player in the sorted list with the first unplayed opponent they can find.
 */
export function generateSwissNextRound(
  participants: ParticipantForDraw[],
  scores: Record<string, number>,
  playedPairs: Set<string>,
  round: number,
  alreadyByedIds: Set<string> = new Set()
): MatchDraft[] {
  // sort by points descending, with a random tiebreak when scores are equal
  const sorted = shuffle(participants).sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));

  // if odd, the lowest-ranked player who has not already received a bye gets the bye
  let byePlayer: ParticipantForDraw | null = null;
  let pool = [...sorted];
  if (pool.length % 2 !== 0) {
    for (let i = pool.length - 1; i >= 0; i--) {
      if (!alreadyByedIds.has(pool[i].id)) {
        byePlayer = pool[i];
        pool.splice(i, 1);
        break;
      }
    }
    if (!byePlayer) { byePlayer = pool.pop() ?? null; } // if everyone already got a bye, the last player is forced to take one
  }

  const matches: MatchDraft[] = [];
  let order = 1;
  const unpaired = [...pool];

  while (unpaired.length > 0) {
    const current = unpaired.shift()!;
    let opponentIndex = unpaired.findIndex((p) => !playedPairs.has(pairKey(current.id, p.id)));
    if (opponentIndex === -1) opponentIndex = 0; // if everyone has already played, a rematch is forced

    const opponent = unpaired.splice(opponentIndex, 1)[0];
    if (opponent) {
      matches.push({ round, match_order: order++, player1_id: current.id, player2_id: opponent.id, status: "scheduled" });
    }
  }

  if (byePlayer) {
    matches.push({ round, match_order: order++, player1_id: byePlayer.id, player2_id: null, status: "bye" });
  }

  return matches;
}