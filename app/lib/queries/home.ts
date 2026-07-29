import { createClient } from "../supabase/server";

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
  const supabase = await createClient();

  const { data: officialData } = await supabase
    .from("matches")
    .select("id, opponent_name, opponent_tag, opponent_logo_url, competition, score_home, score_away, match_date")
    .eq("status", "completed")
    .order("match_date", { ascending: false })
    .limit(5);

  const { data: internalData } = await supabase
    .from("tournament_matches")
    .select(
      "id, player1_score, player2_score, created_at, player1:player1_id(efootball_username), player2:player2_id(efootball_username), tournaments!inner(name)"
    )
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  const normalizedOfficial = (officialData ?? []).map((m) => {
    const home = m.score_home ?? 0;
    const away = m.score_away ?? 0;
    const result = home > away ? "WIN" : home === away ? "DRAW" : "LOSS";
    return {
      id: m.id,
      date: m.match_date,
      competition: m.competition ?? "Friendly",
      opponent: m.opponent_name,
      opponentTag: m.opponent_tag ?? m.opponent_name?.slice(0, 4).toUpperCase() ?? "OPP",
      scoreHome: home,
      scoreAway: away,
      result: result as "WIN" | "DRAW" | "LOSS",
    };
  });

  const normalizedInternal = (internalData ?? []).map((m: any) => {
    const p1 = Array.isArray(m.player1) ? m.player1[0] : m.player1;
    const p2 = Array.isArray(m.player2) ? m.player2[0] : m.player2;
    const tournamentName = Array.isArray(m.tournaments) ? m.tournaments[0]?.name : m.tournaments?.name;
    const home = m.player1_score ?? 0;
    const away = m.player2_score ?? 0;
    const result = home > away ? "WIN" : home === away ? "DRAW" : "LOSS";
    return {
      id: m.id,
      date: m.created_at,
      competition: tournamentName ?? "Internal Tournament",
      opponent: `${p1?.efootball_username ?? "?"} vs ${p2?.efootball_username ?? "?"}`,
      opponentTag: "VS",
      scoreHome: home,
      scoreAway: away,
      result: result as "WIN" | "DRAW" | "LOSS",
    };
  });

  return [...normalizedOfficial, ...normalizedInternal]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

export async function getFixtures() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select("id, opponent_name, competition, match_date, status")
    .in("status", ["upcoming", "live"])
    .order("match_date", { ascending: true })
    .limit(3);

  if (error || !data) return [];

  return data.map((m) => {
    const date = new Date(m.match_date);
    const day = date.toLocaleDateString("en-US", { day: "2-digit" });
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const daysLeft = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return {
      id: m.id,
      day,
      month,
      opponent: `vs ${m.opponent_name ?? "TBD"}`,
      competition: m.competition ?? "Friendly",
      status: m.status === "live" ? "LIVE NOW" : `${daysLeft}D`,
      live: m.status === "live",
    };
  });
}

export async function getTopPerformers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_stats")
    .select("goals, player_details(efootball_username, preferred_position)")
    .order("goals", { ascending: false })
    .limit(4);

  if (error || !data) return [];

  return data.map((row: any) => ({
    name: row.player_details?.efootball_username ?? "Unknown",
    statLabel: "GOALS",
    statValue: String(row.goals ?? 0),
  }));
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