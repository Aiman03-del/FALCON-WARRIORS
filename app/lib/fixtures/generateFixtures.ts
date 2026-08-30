export type ParticipantForDraw = {
  id: string; // player_id
  username: string;
  seed?: number | null; // 1 = strongest. null/undefined = unseeded
};

export type MatchDraft = {
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  status: "scheduled" | "bye";
  group_name?: string | null;
  leg?: number;
  tie_id?: string | null; // নতুন
};
export type GroupAssignment = {
  group_name: string;
  participant: ParticipantForDraw;
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Fairness check: when we need to pick one unpaired participant to receive a
// bye, prefer someone who hasn't already had a bye earlier in this knockout
// run. `alreadyByed` is the set of participant ids who have already received
// a bye in a previous round. We move a not-yet-byed participant to the very
// end of the list so the pairing loop below naturally assigns them the bye
// slot. If everyone in the list has already had a bye (rare, only possible
// once very few participants remain), we leave the order as-is — there's no
// fairer option left.
function pickByeAvoidingRepeat<T extends { id: string }>(list: T[], alreadyByed: Set<string>): T[] {
  if (list.length % 2 === 0) return list;

  const lastEligibleIndex = [...list].reverse().findIndex((p) => !alreadyByed.has(p.id));
  if (lastEligibleIndex === -1) return list; // everyone already had a bye — nothing fairer to do

  const realIndex = list.length - 1 - lastEligibleIndex;
  const copy = [...list];
  const [chosen] = copy.splice(realIndex, 1);
  copy.push(chosen);
  return copy;
}

// Knockout: only round 1 — random pairing, if odd one player gets a bye.
// `alreadyByedIds` lets callers avoid repeating a bye on the same participant
// across rounds (relevant for bye_method = "random", where byes can recur in
// later rounds — see generateKnockoutNextRound below).
export function generateKnockoutRound1(
  participants: ParticipantForDraw[],
  alreadyByedIds: Set<string> = new Set(),
  twoLeg: boolean = false
): MatchDraft[] {
  return generateKnockoutNextRound(participants, 1, alreadyByedIds, twoLeg);
}
function makeTieId(round: number, order: number): string {
  return `tie-r${round}-o${order}-${Math.random().toString(36).slice(2, 8)}`;
}
function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Standard tournament-bracket seeding order, e.g. for size 8: [1,8,4,5,2,7,3,6].
// This guarantees seed 1 and seed 2 can only meet in the final, seeds 1-4 can
// only meet from the semi-final onward, etc. — the same placement method used
// by real single-elimination brackets (tennis, football cup draws, esports).
function standardSeedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const doubled = order.length * 2;
    const next: number[] = [];
    for (const s of order) {
      next.push(s, doubled + 1 - s);
    }
    order = next;
  }
  return order;
}

// Knockout: seeded round 1. Participants with a `seed` are placed using the
// standard bracket seeding table so the strongest seeds are spread apart and
// any byes (when the field isn't a power of 2) land on the *top* seeds —
// exactly like a professional single-elimination draw. Participants without a
// seed are shuffled randomly and slotted in after the seeded ones.
export function generateSeededKnockoutRound1(participants: ParticipantForDraw[], twoLeg: boolean = false): MatchDraft[] {
  const seeded = participants
    .filter((p) => p.seed != null)
    .sort((a, b) => (a.seed as number) - (b.seed as number));
  const unseeded = shuffle(participants.filter((p) => p.seed == null));
  const ordered = [...seeded, ...unseeded]; // index 0 = seed #1 (strongest)

  const n = ordered.length;
  const bracketSize = nextPowerOfTwo(n);
  const slots = standardSeedOrder(bracketSize);

  const matches: MatchDraft[] = [];
  let matchOrder = 1;

  for (let i = 0; i < slots.length; i += 2) {
    const seedA = slots[i];
    const seedB = slots[i + 1];
    const pA = seedA <= n ? ordered[seedA - 1] : null;
    const pB = seedB <= n ? ordered[seedB - 1] : null;

    if (pA && pB) {
      if (!twoLeg) {
        matches.push({
          round: 1,
          match_order: matchOrder++,
          player1_id: pA.id,
          player2_id: pB.id,
          status: "scheduled",
          leg: 1,
        });
        continue;
      }

      const tieId = makeTieId(1, matchOrder);
      matches.push({
        round: 1,
        match_order: matchOrder,
        player1_id: pA.id,
        player2_id: pB.id,
        status: "scheduled",
        leg: 1,
        tie_id: tieId,
      });
      matches.push({
        round: 1,
        match_order: matchOrder,
        player1_id: pB.id,
        player2_id: pA.id,
        status: "scheduled",
        leg: 2,
        tie_id: tieId,
      });
      matchOrder++;
    } else {
      const survivor = pA ?? pB;
      if (survivor) {
        matches.push({
          round: 1,
          match_order: matchOrder++,
          player1_id: survivor.id,
          player2_id: null,
          status: "bye",
          leg: 1,
        });
      }
    }
  }

  return matches;
}

// Knockout: next round from previous round winners.
// IMPORTANT: winners must already be in bracket order (i.e. the order their
// feeder matches appeared in, sorted by match_order) — we pair them
// sequentially (1v2, 3v4, ...) rather than reshuffling, so the bracket tree
// stays consistent and can be drawn with connecting lines round to round.
// Knockout: next round from previous round winners.
// IMPORTANT: winners must already be in bracket order (i.e. the order their
// feeder matches appeared in, sorted by match_order) — we pair them
// sequentially (1v2, 3v4, ...) rather than reshuffling, so the bracket tree
// stays consistent and can be drawn with connecting lines round to round.
export function generateKnockoutNextRound(
  winners: ParticipantForDraw[],
  nextRound: number,
  alreadyByedIds: Set<string> = new Set(),
  twoLeg: boolean = false
): MatchDraft[] {
  const ordered = pickByeAvoidingRepeat(winners, alreadyByedIds);
  const matches: MatchDraft[] = [];
  let order = 1;

  for (let i = 0; i < ordered.length; i += 2) {
    const p1 = ordered[i];
    const p2 = ordered[i + 1];

    if (!p2) {
      matches.push({ round: nextRound, match_order: order++, player1_id: p1.id, player2_id: null, status: "bye", leg: 1 });
      continue;
    }

    if (!twoLeg) {
      matches.push({ round: nextRound, match_order: order++, player1_id: p1.id, player2_id: p2.id, status: "scheduled", leg: 1 });
      continue;
    }

    const tieId = makeTieId(nextRound, order);
    matches.push({ round: nextRound, match_order: order, player1_id: p1.id, player2_id: p2.id, status: "scheduled", leg: 1, tie_id: tieId });
    matches.push({ round: nextRound, match_order: order, player1_id: p2.id, player2_id: p1.id, status: "scheduled", leg: 2, tie_id: tieId });
    order++;
  }

  return matches;
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

// Group Stage draw: splits participants into `groupCount` groups using a
// "snake" distribution (A,B,C,D, D,C,B,A, A,B,C,D, ...) over seeded order —
// this is how real tournaments balance groups so all the top seeds don't end
// up bunched into the same group. Unseeded participants are shuffled first.
export function generateGroups(
  participants: ParticipantForDraw[],
  groupCount: number
): GroupAssignment[] {
  const seeded = participants
    .filter((p) => p.seed != null)
    .sort((a, b) => (a.seed as number) - (b.seed as number));
  const unseeded = shuffle(participants.filter((p) => p.seed == null));
  const ordered = [...seeded, ...unseeded];

  const groupNames = Array.from({ length: groupCount }, (_, i) => String.fromCharCode(65 + i));

  const assignments: GroupAssignment[] = [];
  let g = 0;
  let dir = 1;

  for (const participant of ordered) {
    assignments.push({ group_name: groupNames[g], participant });
    g += dir;
    if (g === groupCount) {
      g = groupCount - 1;
      dir = -1;
    } else if (g < 0) {
      g = 0;
      dir = 1;
    }
  }

  return assignments;
}

// Group Stage fixtures: independent round-robin inside every group. Rounds
// are numbered per-group (Group A's Round 1 can be played alongside Group B's
// Round 1) — the `group_name` tag on each draft is what keeps them apart.
export function generateGroupStageFixtures(
  assignments: GroupAssignment[],
  doubleRound: boolean = false
): MatchDraft[] {
  const byGroup: Record<string, ParticipantForDraw[]> = {};
  for (const a of assignments) {
    (byGroup[a.group_name] ??= []).push(a.participant);
  }

  const all: MatchDraft[] = [];
  for (const [groupName, players] of Object.entries(byGroup)) {
    const drafts = generateRoundRobin(players, doubleRound);
    all.push(...drafts.map((d) => ({ ...d, group_name: groupName })));
  }
  return all;
}

// Knockout Stage seeded from group-stage results. `groupStandings` must
// already be ranked (1st place first) per group. We take the top
// `qualifiersPerGroup` from each group, tier by tier (all 1st-place finishers,
// then all 2nd-place, ...), and rotate every tier below the winners by one
// group-position so a group's runner-up doesn't get dropped right next to
// that same group's winner in the seed list.
export function generateKnockoutFromGroups(
  groupStandings: { groupName: string; ranked: ParticipantForDraw[] }[],
  qualifiersPerGroup: number,
  twoLeg: boolean = false
): MatchDraft[] {
  const tiers: ParticipantForDraw[][] = [];

  for (let pos = 0; pos < qualifiersPerGroup; pos++) {
    const tier = groupStandings
      .map((g) => g.ranked[pos])
      .filter((p): p is ParticipantForDraw => !!p);

    const shift = tier.length > 0 ? pos % tier.length : 0;
    tiers.push([...tier.slice(shift), ...tier.slice(0, shift)]);
  }

  const seededOrder = tiers.flat();
  const withSeeds: ParticipantForDraw[] = seededOrder.map((p, i) => ({ ...p, seed: i + 1 }));

  return generateSeededKnockoutRound1(withSeeds, twoLeg);
}