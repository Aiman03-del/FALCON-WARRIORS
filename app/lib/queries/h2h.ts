import { createClient } from "../supabase/server";


export type H2HResult = {
  totalMeetings: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  recentMeetings: {
    id: string;
    date: string;
    scoreHome: number;
    scoreAway: number;
  }[];
};

// Internal match: H2H between two players
export async function getPlayerH2H(
  player1Id: string,
  player2Id: string,
  excludeMatchId?: string
): Promise<H2HResult> {
  const supabase = await createClient();

  // Single internal matches
  const { data: singleMatches } = await supabase
    .from("matches")
    .select("id, match_date, score_home, score_away, player1_id, player2_id")
    .eq("match_type", "internal")
    .eq("status", "completed")
    .or(
      `and(player1_id.eq.${player1Id},player2_id.eq.${player2Id}),and(player1_id.eq.${player2Id},player2_id.eq.${player1Id})`
    );

  // Tournament matches
  const { data: tournamentMatchesRaw } = await supabase
    .from("tournament_matches")
    .select("id, created_at, player1_score, player2_score, player1_id, player2_id")
    .eq("status", "completed")
    .or(
      `and(player1_id.eq.${player1Id},player2_id.eq.${player2Id}),and(player1_id.eq.${player2Id},player2_id.eq.${player1Id})`
    );

  const normalized = [
    ...(singleMatches ?? [])
      .filter((m) => m.id !== excludeMatchId)
      .map((m) => ({
        id: m.id,
        date: m.match_date,
        p1: m.player1_id,
        scoreP1: m.score_home,
        scoreP2: m.score_away,
      })),
    ...(tournamentMatchesRaw ?? []).map((m) => ({
      id: m.id,
      date: m.created_at,
      p1: m.player1_id,
      scoreP1: m.player1_score,
      scoreP2: m.player2_score,
    })),
  ];

  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;

  const recentMeetings = normalized
    .filter((m) => m.scoreP1 !== null && m.scoreP2 !== null)
    .map((m) => {
      // "home" always means player1Id (function argument)
      const isP1Home = m.p1 === player1Id;
      const scoreHome = isP1Home ? m.scoreP1! : m.scoreP2!;
      const scoreAway = isP1Home ? m.scoreP2! : m.scoreP1!;

      if (scoreHome > scoreAway) homeWins++;
      else if (scoreAway > scoreHome) awayWins++;
      else draws++;

      return { id: m.id, date: m.date, scoreHome, scoreAway };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    totalMeetings: recentMeetings.length,
    homeWins,
    awayWins,
    draws,
    recentMeetings: recentMeetings.slice(0, 5),
  };
}

// External match: Falcon vs a specific opponent club
export async function getClubH2H(
  opponentName: string,
  excludeMatchId?: string
): Promise<H2HResult> {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, match_date, score_home, score_away")
    .eq("match_type", "external")
    .eq("status", "completed")
    .eq("opponent_name", opponentName);

  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;

  const recentMeetings = (matches ?? [])
    .filter((m) => m.id !== excludeMatchId && m.score_home !== null && m.score_away !== null)
    .map((m) => {
      if (m.score_home! > m.score_away!) homeWins++;
      else if (m.score_away! > m.score_home!) awayWins++;
      else draws++;
      return { id: m.id, date: m.match_date, scoreHome: m.score_home!, scoreAway: m.score_away! };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    totalMeetings: recentMeetings.length,
    homeWins,
    awayWins,
    draws,
    recentMeetings: recentMeetings.slice(0, 5),
  };
}