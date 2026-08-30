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

/** এই টুর্নামেন্টে কোন কোন জোড়া ইতিমধ্যে খেলে ফেলেছে (rematch এড়াতে) */
export function getPlayedPairs(matches: SwissMatchRow[]): Set<string> {
  const set = new Set<string>();
  for (const m of matches) {
    if (m.player1_id && m.player2_id) set.add(pairKey(m.player1_id, m.player2_id));
  }
  return set;
}

/** পেয়ারিং-এর জন্য ব্যবহৃত স্কোর — bye-কে পূর্ণ জয় হিসেবে ধরা হয় (স্ট্যান্ডিং টেবিলের থেকে আলাদা হতে পারে) */
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

/** Round 1 — কোনো স্কোর নেই তাই র‍্যান্ডম পেয়ারিং */
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
 * পরের রাউন্ড — পয়েন্ট অনুযায়ী সাজিয়ে কাছাকাছি পয়েন্টধারীদের জোড়া, rematch এড়িয়ে।
 * গ্রিডি পদ্ধতি: সাজানো লিস্টে যাকে প্রথম না-খেলা প্রতিপক্ষ পাওয়া যায় তার সাথে জোড়া বানানো হয়।
 */
export function generateSwissNextRound(
  participants: ParticipantForDraw[],
  scores: Record<string, number>,
  playedPairs: Set<string>,
  round: number,
  alreadyByedIds: Set<string> = new Set()
): MatchDraft[] {
  // পয়েন্ট অনুযায়ী descending সর্ট, সমান পয়েন্টে র‍্যান্ডম টাইব্রেক
  const sorted = shuffle(participants).sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));

  // বিজোড় হলে সবচেয়ে কম-পয়েন্টধারী (যে আগে bye পায়নি) bye পাবে
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
    if (!byePlayer) { byePlayer = pool.pop() ?? null; } // সবাই আগে bye পেলে বাধ্য হয়ে শেষজনকে দেওয়া
  }

  const matches: MatchDraft[] = [];
  let order = 1;
  const unpaired = [...pool];

  while (unpaired.length > 0) {
    const current = unpaired.shift()!;
    let opponentIndex = unpaired.findIndex((p) => !playedPairs.has(pairKey(current.id, p.id)));
    if (opponentIndex === -1) opponentIndex = 0; // সবার সাথেই আগে খেলা হয়ে গেলে বাধ্য হয়ে rematch

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