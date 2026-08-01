import { createClient } from "../supabase/client";


export type LeaderboardEntry = {
  playerId: string;
  slug?: string | null;
  username: string;
  realName: string | null;
  avatarUrl: string | null;
  value: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  points?: number;
  winRate?: number;
  motm?: number;
  secondary?: string;
};

export type LeaderboardScope = "official" | "unofficial";

export type LeaderboardData = {
  points: LeaderboardEntry[];
};

type PlayerInfo = {
  username: string;
  realName: string | null;
  avatarUrl: string | null;
  slug: string | null;
};

type StatAccumulator = {
  goals: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  motm: number;
  ratingTotal: number;
  ratingCount: number;
};

function emptyStat(): StatAccumulator {
  return { goals: 0, matches: 0, wins: 0, draws: 0, losses: 0, motm: 0, ratingTotal: 0, ratingCount: 0 };
}

function applyPvPResult(
  statsMap: Record<string, StatAccumulator>,
  player1Id: string | null,
  player2Id: string | null,
  score1: number,
  score2: number
) {
  if (!player1Id || !player2Id) return;

  const s1 = statsMap[player1Id];
  const s2 = statsMap[player2Id];
  if (!s1 || !s2) return;

  s1.matches++;
  s2.matches++;
  s1.goals += score1;
  s2.goals += score2;

  if (score1 > score2) {
    s1.wins++;
    s2.losses++;
  } else if (score2 > score1) {
    s2.wins++;
    s1.losses++;
  } else {
    s1.draws++;
    s2.draws++;
  }
}

async function getActivePlayers(): Promise<Record<string, PlayerInfo>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_details")
    .select("id, slug, efootball_username, real_name, avatar_url, membership_status")
    .eq("membership_status", "active");

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((p) => [
      p.id,
      {
        username: p.efootball_username,
        realName: p.real_name ?? null,
        avatarUrl: p.avatar_url,
        slug: p.slug ?? null,
      },
    ])
  );
}

async function getBaseStats(scope: LeaderboardScope) {
  const supabase = await createClient();
  const players = await getActivePlayers();
  const statsMap: Record<string, StatAccumulator> = {};

  for (const playerId of Object.keys(players)) {
    statsMap[playerId] = emptyStat();
  }

  if (scope === "unofficial") {
    const { data: internalMatches } = await supabase
      .from("matches")
      .select("player1_id, player2_id, score_home, score_away")
      .eq("match_type", "internal")
      .eq("status", "completed");

    for (const m of internalMatches ?? []) {
      if (m.score_home === null || m.score_away === null) continue;
      applyPvPResult(statsMap, m.player1_id, m.player2_id, m.score_home, m.score_away);
    }

    const { data: tournamentMatches } = await supabase
      .from("tournament_matches")
      .select(
        "id, player1_id, player2_id, player1_score, player2_score, tournaments!inner(type)"
      )
      .eq("status", "completed")
      .eq("tournaments.type", "internal");

    for (const m of tournamentMatches ?? []) {
      if (m.player1_score === null || m.player2_score === null) continue;
      applyPvPResult(statsMap, m.player1_id, m.player2_id, m.player1_score, m.player2_score);
    }

    const { data: motmEvents } = await supabase
      .from("match_events")
      .select("scorer_id, matches!inner(match_type, status)")
      .eq("event_type", "motm");

    for (const e of (motmEvents ?? []) as any[]) {
      const matchInfo = Array.isArray(e.matches) ? e.matches[0] : e.matches;
      if (!matchInfo || matchInfo.status !== "completed" || matchInfo.match_type !== "internal") continue;
      if (e.scorer_id && statsMap[e.scorer_id]) statsMap[e.scorer_id].motm++;
    }

    // Only count ratings that belong to *this* scope's tournament matches —
    // otherwise a rating from an official tournament match would also leak
    // into the unofficial numbers (and vice versa).
    const internalTournamentMatchIds = new Set((tournamentMatches ?? []).map((m: any) => m.id));

    const { data: ratings } = await supabase
      .from("match_ratings")
      .select("player_id, rating, tournament_match_id")
      .not("tournament_match_id", "is", null);

    for (const r of ratings ?? []) {
      if (!r.player_id || !statsMap[r.player_id]) continue;
      if (!internalTournamentMatchIds.has(r.tournament_match_id)) continue;
      statsMap[r.player_id].ratingTotal += Number(r.rating);
      statsMap[r.player_id].ratingCount++;
    }
  } else {
    const { data: battles } = await supabase
      .from("match_squad_battles")
      .select("falcon_player_id, falcon_score, opponent_score, matches!inner(status, match_type)")
      .not("falcon_player_id", "is", null)
      .not("falcon_score", "is", null)
      .not("opponent_score", "is", null);

    for (const b of (battles ?? []) as any[]) {
      const matchInfo = Array.isArray(b.matches) ? b.matches[0] : b.matches;
      if (!matchInfo || matchInfo.status !== "completed" || matchInfo.match_type !== "external") continue;

      const s = statsMap[b.falcon_player_id];
      if (!s) continue;

      s.matches++;
      s.goals += b.falcon_score;

      if (b.falcon_score > b.opponent_score) s.wins++;
      else if (b.falcon_score < b.opponent_score) s.losses++;
      else s.draws++;
    }

    const { data: squadRows } = await supabase
      .from("match_squad")
      .select("match_id, player_id")
      .not("player_id", "is", null);

    const { data: goalEntries } = await supabase
      .from("match_goal_entries")
      .select("match_id, player_id, goals")
      .not("player_id", "is", null);

    const { data: externalMatches } = await supabase
      .from("matches")
      .select("id, status, match_type, score_home, score_away")
      .eq("match_type", "external")
      .eq("status", "completed");

    const externalGoalMap: Record<string, Record<string, number>> = {};
    for (const entry of goalEntries ?? []) {
      if (!entry.match_id || !entry.player_id) continue;
      externalGoalMap[entry.match_id] ??= {};
      externalGoalMap[entry.match_id][entry.player_id] = Number(entry.goals ?? 0);
    }

    const externalMatchMap = new Map((externalMatches ?? []).map((match: any) => [match.id, match]));

    for (const row of squadRows ?? []) {
      const matchInfo = externalMatchMap.get(row.match_id);
      if (!matchInfo) continue;

      const s = statsMap[row.player_id];
      if (!s) continue;

      const ownGoals = externalGoalMap[row.match_id]?.[row.player_id] ?? 0;
      const scoreHome = Number(matchInfo.score_home ?? 0);
      const scoreAway = Number(matchInfo.score_away ?? 0);

      s.matches++;
      s.goals += ownGoals;

      if (scoreHome > scoreAway) s.wins++;
      else if (scoreHome < scoreAway) s.losses++;
      else s.draws++;
    }

    // Official tournament matches (player vs player) — this block was missing
    // entirely before, which is why the Official leaderboard undercounted
    // matches/wins/goals for anyone whose games came from an official-type
    // tournament instead of an external friendly match.
    const { data: officialTournamentMatches } = await supabase
      .from("tournament_matches")
      .select(
        "id, player1_id, player2_id, player1_score, player2_score, tournaments!inner(type)"
      )
      .eq("status", "completed")
      .eq("tournaments.type", "official");

    for (const m of officialTournamentMatches ?? []) {
      if (m.player1_score === null || m.player2_score === null) continue;
      applyPvPResult(statsMap, m.player1_id, m.player2_id, m.player1_score, m.player2_score);
    }

    const { data: motmEvents } = await supabase
      .from("match_events")
      .select("scorer_id, matches!inner(match_type, status)")
      .eq("event_type", "motm");

    for (const e of (motmEvents ?? []) as any[]) {
      const matchInfo = Array.isArray(e.matches) ? e.matches[0] : e.matches;
      if (!matchInfo || matchInfo.status !== "completed" || matchInfo.match_type !== "external") continue;
      if (e.scorer_id && statsMap[e.scorer_id]) statsMap[e.scorer_id].motm++;
    }

    const { data: ratings } = await supabase
      .from("match_ratings")
      .select("player_id, rating, match_id")
      .not("match_id", "is", null);

    for (const r of ratings ?? []) {
      if (!r.player_id || !statsMap[r.player_id]) continue;
      statsMap[r.player_id].ratingTotal += Number(r.rating);
      statsMap[r.player_id].ratingCount++;
    }

    // Ratings from official tournament matches also count toward the
    // Official rating leaderboard.
    const officialTournamentMatchIds = new Set((officialTournamentMatches ?? []).map((m: any) => m.id));

    const { data: tournamentRatings } = await supabase
      .from("match_ratings")
      .select("player_id, rating, tournament_match_id")
      .not("tournament_match_id", "is", null);

    for (const r of tournamentRatings ?? []) {
      if (!r.player_id || !statsMap[r.player_id]) continue;
      if (!officialTournamentMatchIds.has(r.tournament_match_id)) continue;
      statsMap[r.player_id].ratingTotal += Number(r.rating);
      statsMap[r.player_id].ratingCount++;
    }
  }

  return Object.entries(statsMap)
    .filter(([playerId]) => players[playerId])
    .map(([playerId, stat]) => ({
      playerId,
      slug: players[playerId].slug,
      username: players[playerId].username,
      realName: players[playerId].realName,
      avatarUrl: players[playerId].avatarUrl,
      goals: stat.goals,
      matches: stat.matches,
      wins: stat.wins,
      draws: stat.draws,
      losses: stat.losses,
      motm: stat.motm,
      avgRating:
        stat.ratingCount > 0
          ? Math.round((stat.ratingTotal / stat.ratingCount) * 10) / 10
          : null,
    }));
}

export async function getTopScorers(
  scope: LeaderboardScope = "official",
  limit = 10
): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats(scope);
  return stats
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      username: s.username,
      realName: s.realName,
      avatarUrl: s.avatarUrl,
      value: s.goals,
      matches: s.matches,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      points: s.wins * 3 + s.draws,
      winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
      motm: s.motm,
      secondary: `${s.matches} matches`,
    }));
}

export async function getTopAssists(
  scope: LeaderboardScope = "official",
  limit = 10
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_stats")
    .select(
      "player_id, assists, matches, wins, draws, losses, player_details(id, efootball_username, real_name, avatar_url, membership_status)"
    );

  if (error || !data) return [];

  return data
    .map((row: any) => {
      const pd = Array.isArray(row.player_details) ? row.player_details[0] : row.player_details;
      if (!pd || pd.membership_status !== "active" || !row.assists) return null;
      return {
        playerId: pd.id,
        username: pd.efootball_username,
        realName: pd.real_name ?? null,
        avatarUrl: pd.avatar_url,
        value: row.assists,
        matches: row.matches ?? 0,
        wins: row.wins ?? 0,
        draws: row.draws ?? 0,
        losses: row.losses ?? 0,
        points: (row.wins ?? 0) * 3 + (row.draws ?? 0),
        winRate: row.matches ? Math.round(((row.wins ?? 0) / row.matches) * 100) : 0,
        secondary: `${row.matches ?? 0} matches`,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function getTopWinRate(
  scope: LeaderboardScope = "official",
  limit = 10,
  minMatches = 3
): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats(scope);
  return stats
    .filter((s) => s.matches >= minMatches)
    .map((s) => ({ ...s, winRate: Math.round((s.wins / s.matches) * 100) }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      username: s.username,
      realName: s.realName,
      avatarUrl: s.avatarUrl,
      value: s.winRate,
      matches: s.matches,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      points: s.wins * 3 + s.draws,
      winRate: s.winRate,
      secondary: `${s.wins}/${s.matches} wins`,
    }));
}

export async function getTopMotm(
  scope: LeaderboardScope = "official",
  limit = 10
): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats(scope);
  return stats
    .filter((s) => s.motm > 0)
    .sort((a, b) => b.motm - a.motm)
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      username: s.username,
      realName: s.realName,
      avatarUrl: s.avatarUrl,
      value: s.motm,
      matches: s.matches,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      points: s.wins * 3 + s.draws,
      motm: s.motm,
      secondary: `${s.matches} matches`,
    }));
}

export async function getTopRating(
  scope: LeaderboardScope = "official",
  limit = 10,
  minMatches = 3
): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats(scope);
  return stats
    .filter((s) => s.avgRating !== null && s.matches >= minMatches)
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      username: s.username,
      realName: s.realName,
      avatarUrl: s.avatarUrl,
      value: s.avgRating ?? 0,
      matches: s.matches,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      points: s.wins * 3 + s.draws,
      winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
      motm: s.motm,
      secondary: `${s.matches} matches`,
    }));
}

export async function getTopByPoints(
  scope: LeaderboardScope = "official",
  limit = 500
): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats(scope);
  return stats
    .filter((s) => s.matches > 0)
    .map((s) => ({
      ...s,
      points: s.wins * 3 + s.draws,
      winRate: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0,
    }))
    // পয়েন্ট অনুযায়ী সাজানো — সমান পয়েন্ট হলে বেশি গোল যার, সে উপরে
    .sort((a, b) => b.points - a.points || b.goals - a.goals)
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      slug: s.slug,
      username: s.username,
      realName: s.realName,
      avatarUrl: s.avatarUrl,
      value: s.goals,
      matches: s.matches,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      points: s.points,
      winRate: s.winRate,
      motm: s.motm,
      secondary: `${s.wins}W ${s.draws}D ${s.losses}L`,
    }));
}

export async function getLeaderboardData(scope: LeaderboardScope): Promise<LeaderboardData> {
  const points = await getTopByPoints(scope);
  return { points };
}

export type Period = "weekly" | "monthly" | "yearly";

function getPeriodStart(period: Period): Date {
  const now = new Date();

  if (period === "weekly") {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(now.getFullYear(), 0, 1);
}

export async function getTopPerformerByPeriod(period: Period) {
  const supabase = await createClient();
  const start = getPeriodStart(period);

  const { data: events } = await supabase
    .from("match_events")
    .select("scorer_id, event_type, created_at, player_details(id, efootball_username, real_name, avatar_url)")
    .eq("event_type", "goal")
    .gte("created_at", start.toISOString());

  if (!events || events.length === 0) return null;

  const countMap: Record<string, { username: string; realName: string | null; avatarUrl: string | null; count: number }> = {};

  for (const e of events as any[]) {
    const pd = Array.isArray(e.player_details) ? e.player_details[0] : e.player_details;
    if (!pd) continue;
    if (!countMap[pd.id]) {
      countMap[pd.id] = {
        username: pd.efootball_username,
        realName: pd.real_name ?? null,
        avatarUrl: pd.avatar_url,
        count: 0,
      };
    }
    countMap[pd.id].count++;
  }

  const sorted = Object.entries(countMap).sort((a, b) => b[1].count - a[1].count);
  if (sorted.length === 0) return null;

  const [playerId, info] = sorted[0];
  return { playerId, ...info };
}