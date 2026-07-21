import { createClient } from "../supabase/server";


export type LeaderboardEntry = {
  playerId: string;
  username: string;
  avatarUrl: string | null;
  value: number;
  secondary?: string;
};

async function getBaseStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_stats")
    .select(
      "player_id, goals, assists, matches, wins, draws, losses, motm_count, player_details(id, efootball_username, avatar_url, membership_status)"
    );

  if (error || !data) return [];

  return data
    .map((row: any) => {
      const pd = Array.isArray(row.player_details) ? row.player_details[0] : row.player_details;
      if (!pd || pd.membership_status !== "active") return null;
      return {
        playerId: pd.id,
        username: pd.efootball_username,
        avatarUrl: pd.avatar_url,
        goals: row.goals ?? 0,
        assists: row.assists ?? 0,
        matches: row.matches ?? 0,
        wins: row.wins ?? 0,
        motm: row.motm_count ?? 0,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function getTopScorers(limit = 10): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats();
  return stats
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      username: s.username,
      avatarUrl: s.avatarUrl,
      value: s.goals,
      secondary: `${s.matches} matches`,
    }));
}

export async function getTopAssists(limit = 10): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats();
  return stats
    .filter((s) => s.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      username: s.username,
      avatarUrl: s.avatarUrl,
      value: s.assists,
      secondary: `${s.matches} matches`,
    }));
}

export async function getTopWinRate(limit = 10, minMatches = 3): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats();
  return stats
    .filter((s) => s.matches >= minMatches)
    .map((s) => ({ ...s, winRate: Math.round((s.wins / s.matches) * 100) }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      username: s.username,
      avatarUrl: s.avatarUrl,
      value: s.winRate,
      secondary: `${s.wins}/${s.matches} wins`,
    }));
}

export async function getTopMotm(limit = 10): Promise<LeaderboardEntry[]> {
  const stats = await getBaseStats();
  return stats
    .filter((s) => s.motm > 0)
    .sort((a, b) => b.motm - a.motm)
    .slice(0, limit)
    .map((s) => ({
      playerId: s.playerId,
      username: s.username,
      avatarUrl: s.avatarUrl,
      value: s.motm,
      secondary: `${s.matches} matches`,
    }));
}

export type Period = "weekly" | "monthly" | "yearly";

function getPeriodStart(period: Period): Date {
  const now = new Date();

  if (period === "weekly") {
    const day = now.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // yearly
  return new Date(now.getFullYear(), 0, 1);
}

export async function getTopPerformerByPeriod(period: Period) {
  const supabase = await createClient();
  const start = getPeriodStart(period);

  const { data: events } = await supabase
    .from("match_events")
    .select("scorer_id, event_type, created_at, player_details(id, efootball_username, avatar_url)")
    .eq("event_type", "goal")
    .gte("created_at", start.toISOString());

  if (!events || events.length === 0) return null;

  const countMap: Record<string, { username: string; avatarUrl: string | null; count: number }> = {};

  for (const e of events as any[]) {
    const pd = Array.isArray(e.player_details) ? e.player_details[0] : e.player_details;
    if (!pd) continue;
    if (!countMap[pd.id]) {
      countMap[pd.id] = { username: pd.efootball_username, avatarUrl: pd.avatar_url, count: 0 };
    }
    countMap[pd.id].count++;
  }

  const sorted = Object.entries(countMap).sort((a, b) => b[1].count - a[1].count);
  if (sorted.length === 0) return null;

  const [playerId, info] = sorted[0];
  return { playerId, ...info };
}