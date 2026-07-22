export type ParticipantForDraw = {
  id: string; // player_id
  username: string;
};

export type MatchDraft = {
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  status: "scheduled" | "bye";
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Knockout: only round 1 — random pairing, if odd one player gets a bye
export function generateKnockoutRound1(participants: ParticipantForDraw[]): MatchDraft[] {
  const shuffled = shuffle(participants);
  const matches: MatchDraft[] = [];
  let order = 1;

  for (let i = 0; i < shuffled.length; i += 2) {
    const p1 = shuffled[i];
    const p2 = shuffled[i + 1];

    if (!p2) {
      // Odd number — last player gets a bye and advances to the next round
      matches.push({
        round: 1,
        match_order: order++,
        player1_id: p1.id,
        player2_id: null,
        status: "bye",
      });
    } else {
      matches.push({
        round: 1,
        match_order: order++,
        player1_id: p1.id,
        player2_id: p2.id,
        status: "scheduled",
      });
    }
  }

  return matches;
}

// Knockout: next round from previous round winners
export function generateKnockoutNextRound(
  winners: ParticipantForDraw[],
  nextRound: number
): MatchDraft[] {
  return generateKnockoutRound1(winners).map((m) => ({ ...m, round: nextRound }));
}

// League: Round-robin (circle method) — everyone plays everyone once (or twice)
export function generateRoundRobin(
  participants: ParticipantForDraw[],
  doubleRound: boolean = false
): MatchDraft[] {
  const list = [...participants];
  const hasBye = list.length % 2 !== 0;
  if (hasBye) list.push({ id: "__BYE__", username: "BYE" });

  const n = list.length;
  const totalRounds = n - 1;
  const half = n / 2;
  const firstLegMatches: MatchDraft[] = [];

  let arr = shuffle(list);

  for (let round = 1; round <= totalRounds; round++) {
    let order = 1;
    for (let i = 0; i < half; i++) {
      const p1 = arr[i];
      const p2 = arr[n - 1 - i];

      if (p1.id === "__BYE__" || p2.id === "__BYE__") {
        const real = p1.id === "__BYE__" ? p2 : p1;
        firstLegMatches.push({
          round,
          match_order: order++,
          player1_id: real.id,
          player2_id: null,
          status: "bye",
        });
        continue;
      }

      firstLegMatches.push({
        round,
        match_order: order++,
        player1_id: p1.id,
        player2_id: p2.id,
        status: "scheduled",
      });
    }

    // rotate (first player stays fixed, rest rotate)
    const fixed = arr[0];
    const rotating = arr.slice(1);
    rotating.unshift(rotating.pop()!);
    arr = [fixed, ...rotating];
  }

  if (!doubleRound) {
    return firstLegMatches;
  }

  // second leg — same pairs, but reversed home/away
  const secondLegMatches: MatchDraft[] = firstLegMatches
    .filter((m) => m.status !== "bye")
    .map((m) => ({
      round: m.round + totalRounds,
      match_order: m.match_order,
      player1_id: m.player2_id,
      player2_id: m.player1_id,
      status: "scheduled" as const,
    }));

  const byeMatches = firstLegMatches
    .filter((m) => m.status === "bye")
    .map((m) => ({ ...m, round: m.round + totalRounds }));

  return [...firstLegMatches, ...secondLegMatches, ...byeMatches];
}