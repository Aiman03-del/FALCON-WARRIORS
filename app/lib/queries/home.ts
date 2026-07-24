import { createClient } from "../supabase/server";

// Mock data for home page
const MOCK_STATS = {
  members: 24,
  matches: 45,
  trophies: 8,
  winRate: 72,
};

export async function getStats() {
  try {
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
  } catch (error) {
    return MOCK_STATS;
  }
}

const MOCK_RECENT_RESULTS = [
  {
    id: "ext-3",
    competition: "International League",
    opponent: "Tiger Squad",
    opponentTag: "TGR",
    scoreHome: 3,
    scoreAway: 1,
    result: "WIN" as const,
  },
  {
    id: "ext-1",
    competition: "Champions Cup",
    opponent: "Silver Strikers",
    opponentTag: "SLS",
    scoreHome: 2,
    scoreAway: 2,
    result: "DRAW" as const,
  },
  {
    id: "ext-2",
    competition: "International League",
    opponent: "Golden Hawks",
    opponentTag: "GHA",
    scoreHome: 4,
    scoreAway: 2,
    result: "WIN" as const,
  },
];

export async function getRecentResults() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("matches")
      .select("id, opponent_name, opponent_tag, competition, score_home, score_away, match_date")
      .eq("status", "completed")
      .order("match_date", { ascending: false })
      .limit(3);

    if (error || !data) return MOCK_RECENT_RESULTS;

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
  } catch (error) {
    return MOCK_RECENT_RESULTS;
  }
}

const MOCK_FIXTURES = [
  {
    id: "fix-1",
    day: "28",
    month: "JUL",
    opponent: "vs Phoenix FC",
    competition: "International League",
    status: "3D",
    live: false,
  },
  {
    id: "fix-2",
    day: "31",
    month: "JUL",
    opponent: "vs Dragon United",
    competition: "Champions Cup",
    status: "6D",
    live: false,
  },
  {
    id: "fix-3",
    day: "04",
    month: "AUG",
    opponent: "vs Sky Warriors",
    competition: "International League",
    status: "11D",
    live: false,
  },
];

export async function getFixtures() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("matches")
      .select("id, opponent_name, competition, match_date, status")
      .in("status", ["upcoming", "live"])
      .order("match_date", { ascending: true })
      .limit(3);

    if (error || !data) return MOCK_FIXTURES;

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
  } catch (error) {
    return MOCK_FIXTURES;
  }
}

const MOCK_TOP_PERFORMERS = [
  { name: "Ahmed_Pro", statLabel: "GOALS", statValue: "18" },
  { name: "Hassan_Elite", statLabel: "GOALS", statValue: "16" },
  { name: "Karim_Sharp", statLabel: "GOALS", statValue: "14" },
  { name: "Bilal_Speed", statLabel: "GOALS", statValue: "12" },
];

export async function getTopPerformers() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("player_stats")
      .select("goals, player_details(efootball_username, preferred_position)")
      .order("goals", { ascending: false })
      .limit(4);

    if (error || !data) return MOCK_TOP_PERFORMERS;

    return data.map((row: any) => ({
      name: row.player_details?.efootball_username ?? "Unknown",
      statLabel: "GOALS",
      statValue: String(row.goals ?? 0),
    }));
  } catch (error) {
    return MOCK_TOP_PERFORMERS;
  }
}

const MOCK_ACHIEVEMENTS = [
  { id: "ach-1", label: "CHAMPIONS LEAGUE 2024" },
  { id: "ach-2", label: "BEST ATTACK 2023" },
  { id: "ach-3", label: "TOURNAMENT WINNERS 2022" },
  { id: "ach-4", label: "UNBEATEN RUN 2024" },
  { id: "ach-5", label: "TEAM OF THE YEAR 2023" },
  { id: "ach-6", label: "RISING STARS 2022" },
];

export async function getAchievements() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("achievements")
      .select("id, title, season")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data) return MOCK_ACHIEVEMENTS;

    return data.map((a) => ({
      id: a.id,
      label: a.season ? `${a.title.toUpperCase()} ${a.season}` : a.title.toUpperCase(),
    }));
  } catch (error) {
    return MOCK_ACHIEVEMENTS;
  }
}

const MOCK_LATEST_NEWS = [
  {
    id: "news-1",
    category: "CLUB NEWS",
    title: "Falcon Warriors Secure Victory in International Championship",
    date: "Jul 24, 2026",
    imageUrl: "https://via.placeholder.com/400x300?text=Championship+Victory",
  },
  {
    id: "news-2",
    category: "PLAYER NEWS",
    title: "Ahmed_Pro Named Player of the Month",
    date: "Jul 20, 2026",
    imageUrl: "https://via.placeholder.com/400x300?text=Player+Award",
  },
  {
    id: "news-3",
    category: "TOURNAMENT",
    title: "New Season Tournament Schedule Announced",
    date: "Jul 18, 2026",
    imageUrl: "https://via.placeholder.com/400x300?text=Tournament+Schedule",
  },
];

export async function getLatestNews() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("news")
      .select("id, title, category, cover_image_url, published_at")
      .order("published_at", { ascending: false })
      .limit(3);

    if (error || !data) return MOCK_LATEST_NEWS;

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
  } catch (error) {
    return MOCK_LATEST_NEWS;
  }
}

const MOCK_GALLERY = [
  { id: "gal-1", image_url: "https://via.placeholder.com/300x300?text=Match+Photo+1", caption: "Match Day Victory" },
  { id: "gal-2", image_url: "https://via.placeholder.com/300x300?text=Match+Photo+2", caption: "Team Celebration" },
  { id: "gal-3", image_url: "https://via.placeholder.com/300x300?text=Match+Photo+3", caption: "Championship Final" },
  { id: "gal-4", image_url: "https://via.placeholder.com/300x300?text=Match+Photo+4", caption: "Training Session" },
  { id: "gal-5", image_url: "https://via.placeholder.com/300x300?text=Match+Photo+5", caption: "Trophy Lift" },
  { id: "gal-6", image_url: "https://via.placeholder.com/300x300?text=Match+Photo+6", caption: "Team Photo" },
];

export async function getGallery() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("gallery")
      .select("id, image_url, caption")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data) return MOCK_GALLERY;

    return data;
  } catch (error) {
    return MOCK_GALLERY;
  }
}
