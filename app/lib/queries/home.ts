import { createClient } from "../supabase/client";

export async function getStats() {
  const supabase = await createClient();

  const [{ count: members }, { count: totalMatches }, { count: trophies }, { data: completedMatches }] =
    await Promise.all([
      supabase.from("player_details").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("achievements").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("score_home, score_away").eq("status", "completed"),
    ]);

  let winRate = 0;
  if (completedMatches && completedMatches.length > 0) {
    const wins = completedMatches.filter(
      (m) => (m.score_home ?? 0) > (m.score_away ?? 0)
    ).length;
    winRate = Math.round((wins / completedMatches.length) * 100);
  }

  return {
    members: members ?? 0,
    matches: totalMatches ?? 0,
    trophies: trophies ?? 0,
    winRate,
  };
}

export async function getRecentResults() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select("id, opponent_name, opponent_tag, competition, score_home, score_away, match_date")
    .eq("status", "completed")
    .order("match_date", { ascending: false })
    .limit(3);

  if (error || !data) return [];

  return data.map((m) => {
    const home = m.score_home ?? 0;
    const away = m.score_away ?? 0;
    const result = home > away ? "WIN" : home === away ? "DRAW" : "LOSS";
    return {
      id: m.id,
      competition: m.competition ?? "Friendly",
      opponent: m.opponent_name,
      opponentTag: m.opponent_tag ?? m.opponent_name.slice(0, 4).toUpperCase(),
      scoreHome: home,
      scoreAway: away,
      result: result as "WIN" | "DRAW" | "LOSS",
    };
  });
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

    const daysLeft = Math.ceil(
      (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: m.id,
      day,
      month,
      opponent: `vs ${m.opponent_name}`,
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