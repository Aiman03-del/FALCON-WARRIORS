import { createClient } from "../supabase/client";
import { getTopScorers } from "./leaderboards";

const MOCK_RECENT_RESULTS = [
  {
    id: "ext-3",
    competition: "International League",
    isOfficial: true,
    opponent: "Tiger Squad",
    opponentTag: "TGR",
    opponentLogoUrl: null as string | null,
    scoreHome: 3,
    scoreAway: 1,
    matchDate: new Date().toISOString(),
    result: "WIN" as const,
  },
  {
    id: "ext-1",
    competition: "Champions Cup",
    isOfficial: true,
    opponent: "Silver Strikers",
    opponentTag: "SLS",
    opponentLogoUrl: null as string | null,
    scoreHome: 2,
    scoreAway: 2,
    matchDate: new Date().toISOString(),
    result: "DRAW" as const,
  },
  {
    id: "ext-2",
    competition: "International League",
    isOfficial: true,
    opponent: "Golden Hawks",
    opponentTag: "GHA",
    opponentLogoUrl: null as string | null,
    scoreHome: 4,
    scoreAway: 2,
    matchDate: new Date().toISOString(),
    result: "WIN" as const,
  },
];

export async function getStats() {
  const supabase = await createClient();

  const [
    { count: members },
    { count: officialCompletedCount },
    { count: trophies },
    { data: officialCompleted },
    { data: internalCompleted },
  ] = await Promise.all([
    supabase.from("player_details").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("score_home, score_away").eq("status", "completed"),
    supabase
      .from("tournament_matches")
      .select("player1_score, player2_score")
      .eq("status", "completed"),
  ]);

  const { count: internalCompletedCount } = await supabase
    .from("tournament_matches")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const officialWins = (officialCompleted ?? []).filter(
    (m) => (m.score_home ?? 0) > (m.score_away ?? 0)
  ).length;

  // Internal matches: প্রতিটা ম্যাচে দুইজন প্লেয়ার, তাই একটা "win" ধারণা প্রযোজ্য না —
  // শুধু non-draw ম্যাচ গণনা করে ধারণাগত win rate হিসেবে রাখা হলো (bye বাদে)
  const internalDecisive = (internalCompleted ?? []).filter(
    (m) => m.player1_score !== null && m.player2_score !== null && m.player1_score !== m.player2_score
  ).length;

  const totalCompleted = (officialCompleted?.length ?? 0) + (internalCompleted?.length ?? 0);
  const totalWins = officialWins + internalDecisive; // approximate combined metric
  const winRate = totalCompleted > 0 ? Math.round((totalWins / totalCompleted) * 100) : 0;

  return {
    members: members ?? 0,
    matches: (officialCompletedCount ?? 0) + (internalCompletedCount ?? 0),
    trophies: trophies ?? 0,
    winRate,
  };
}

export async function getRecentResults() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("matches")
      .select(
        "id, opponent_name, opponent_tag, opponent_logo_url, competition, match_type, score_home, score_away, match_date, tournament_id"
      )
      .eq("status", "completed")
      .order("match_date", { ascending: false })
      .limit(3);

    if (error || !data) return [];

    // Tournament names fetched separately — no embedded FK join needed, so this
    // works even without a real foreign key constraint set up on tournament_id.
    const tournamentIds = [...new Set(data.map((m) => m.tournament_id).filter(Boolean))];
    const tournamentNames = new Map<string, string>();
    if (tournamentIds.length > 0) {
      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("id, name")
        .in("id", tournamentIds as string[]);
      for (const t of tournaments ?? []) tournamentNames.set(t.id, t.name);
    }

    return data.map((m: any) => {
      const home = m.score_home ?? 0;
      const away = m.score_away ?? 0;
      const result = home > away ? "WIN" : home === away ? "DRAW" : "LOSS";

      return {
        id: m.id,
        competition: (m.tournament_id && tournamentNames.get(m.tournament_id)) || m.competition || "Friendly Match",
        isOfficial: m.match_type === "external",
        opponent: m.opponent_name,
        opponentTag: m.opponent_tag ?? m.opponent_name.slice(0, 4).toUpperCase(),
        opponentLogoUrl: m.opponent_logo_url ?? null,
        scoreHome: home,
        scoreAway: away,
        matchDate: m.match_date,
        result: result as "WIN" | "DRAW" | "LOSS",
      };
    });
  } catch (error) {
    return [];
  }
}

const MOCK_RUNNING_TOURNAMENTS = [
  {
    id: "tour-1",
    name: "Falcon Championship League",
    type: "internal" as const,
    format: "league",
    status: "ongoing" as const,
    startDate: null as string | null,
    endDate: null as string | null,
  },
  {
    id: "tour-2",
    name: "International Champions Cup",
    type: "official" as const,
    format: null,
    status: "upcoming" as const,
    startDate: null as string | null,
    endDate: null as string | null,
  },
];

export async function getRunningTournaments() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tournaments")
      .select("id, slug, name, type, format, status, start_date, end_date")
      .order("start_date", { ascending: false })
      .limit(3);

    if (error || !data) return MOCK_RUNNING_TOURNAMENTS;

    return data.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      type: (t.type === "official" ? "official" : "internal") as "internal" | "official",
      format: t.format as string | null,
      status: (t.status === "completed" ? "completed" : t.status === "ongoing" ? "ongoing" : "upcoming") as "ongoing" | "upcoming" | "completed",
      startDate: t.start_date,
      endDate: t.end_date,
    }));
  } catch (error) {
    return MOCK_RUNNING_TOURNAMENTS;
  }
}

export async function getTopPerformers() {
  try {
    const topScorers = await getTopScorers("official", 6);
    return topScorers.map((s) => ({
      id: s.playerId,
      slug: s.slug ?? null,
      username: s.username,
      name: s.realName?.trim() || s.username,
      avatarUrl: s.avatarUrl,
      statLabel: "GOALS",
      statValue: String(s.value),
    }));
  } catch (error) {
    return [];
  }
}

export async function getAchievements() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("achievements")
    .select("id, title, season")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) return [];

  return data.map((a) => ({
    id: a.id,
    label: a.season ? `${a.title.toUpperCase()} ${a.season}` : a.title.toUpperCase(),
  }));
}

export async function getLatestNews() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news")
    .select("id, title, category, cover_image_url, published_at")
    .order("published_at", { ascending: false })
    .limit(3);

  if (error || !data) return [];

  return data.map((n) => ({
    id: n.id,
    category: (n.category ?? "club_news").replace("_", " ").toUpperCase(),
    title: n.title,
    date: new Date(n.published_at).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    imageUrl: n.cover_image_url as string | null,
  }));
}

export async function getGallery() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gallery")
    .select("id, image_url, caption")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) return [];

  return data;
}