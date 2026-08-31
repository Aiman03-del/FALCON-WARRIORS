import { createClient } from "../supabase/client";
import { getTopByPoints } from "./leaderboards";

export async function getStats() {
  try {
    const supabase = await createClient();

    const [
      { count: members },
      { count: officialCompletedCount },
      { count: trophies },
      { data: officialCompleted },
      { count: internalCompletedCount },
    ] = await Promise.all([
      supabase.from("player_details").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("achievements").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("score_home, score_away").eq("status", "completed"),
      supabase.from("tournament_matches").select("*", { count: "exact", head: true }).eq("status", "completed"),
    ]);

    // শুধু official club matches দিয়েই win rate হিসাব করা হচ্ছে,
    // কারণ internal (player vs player) ম্যাচে ক্লাবের জয়-পরাজয়ের ধারণা প্রযোজ্য না।
    const officialWins = (officialCompleted ?? []).filter(
      (m) => (m.score_home ?? 0) > (m.score_away ?? 0)
    ).length;
    const officialTotal = officialCompleted?.length ?? 0;
    const winRate = officialTotal > 0 ? Math.round((officialWins / officialTotal) * 100) : 0;

    return {
      members: members ?? 0,
      matches: (officialCompletedCount ?? 0) + (internalCompletedCount ?? 0),
      trophies: trophies ?? 0,
      winRate,
    };
  } catch (error) {
    console.error("[getStats] failed:", error);
    return { members: 0, matches: 0, trophies: 0, winRate: 0 };
  }
}

export async function getRecentResults() {
  try {
    const supabase = await createClient();

    const [{ data: matchesData, error: matchesError }, { data: tournamentData, error: tournamentError }] = await Promise.all([
      supabase
        .from("matches")
        .select(
          "id, slug, opponent_name, opponent_tag, opponent_logo_url, competition, match_type, score_home, score_away, match_date, tournament_id"
        )
        .eq("status", "completed")
        .order("match_date", { ascending: false })
        .limit(3),
      supabase
        .from("tournament_matches")
        .select(
          "id, created_at, player1_id, player2_id, player1_score, player2_score, tournaments!inner(id, name, type)"
        )
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    if (matchesError) console.error("[getRecentResults] matches query failed:", matchesError);
    if (tournamentError) console.error("[getRecentResults] tournament_matches query failed:", tournamentError);

    const tournamentIds = [...new Set((matchesData ?? []).map((m) => m.tournament_id).filter(Boolean))];
    const tournamentNames = new Map<string, string>();
    if (tournamentIds.length > 0) {
      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("id, name")
        .in("id", tournamentIds as string[]);
      for (const t of tournaments ?? []) tournamentNames.set(t.id, t.name);
    }

    const playerIds = Array.from(
      new Set([
        ...((tournamentData ?? []).map((m) => m.player1_id).filter(Boolean) as string[]),
        ...((tournamentData ?? []).map((m) => m.player2_id).filter(Boolean) as string[]),
      ])
    );

    const playerMap = new Map<string, { id: string; slug: string | null; efootball_username: string; real_name: string | null; avatar_url: string | null }>();
    if (playerIds.length > 0) {
      const { data: players } = await supabase
        .from("player_details")
        .select("id, slug, efootball_username, real_name, avatar_url")
        .in("id", playerIds);
      for (const player of players ?? []) playerMap.set(player.id, player);
    }

    const recentMatches = [
      ...(matchesData ?? []).map((m: any) => {
        const home = m.score_home ?? 0;
        const away = m.score_away ?? 0;
        const result = home > away ? "WIN" : home === away ? "DRAW" : "LOSS";

        return {
          id: m.id,
          slug: m.slug ?? m.id,
          competition: (m.tournament_id && tournamentNames.get(m.tournament_id)) || m.competition || "Friendly Match",
          isOfficial: m.match_type === "external",
          opponent: m.opponent_name,
          opponentTag: m.opponent_tag ?? m.opponent_name?.slice(0, 4).toUpperCase() ?? "OPP",
          opponentLogoUrl: m.opponent_logo_url ?? null,
          scoreHome: home,
          scoreAway: away,
          matchDate: m.match_date,
          result: result as "WIN" | "DRAW" | "LOSS",
        };
      }),
      ...(tournamentData ?? []).map((m: any) => {
        const p1 = playerMap.get(m.player1_id);
        const p2 = playerMap.get(m.player2_id);
        const home = Number(m.player1_score ?? 0);
        const away = Number(m.player2_score ?? 0);
        const result = home > away ? "WIN" : home === away ? "DRAW" : "LOSS";

        return {
          id: `tournament-${m.id}`,
          slug: p1?.slug ?? m.id,
          competition: m.tournaments?.name ?? "Tournament Match",
          isOfficial: m.tournaments?.type === "official",
          opponent: p2?.real_name || p2?.efootball_username || "Opponent",
          opponentTag: (p2?.efootball_username ?? "OPP").slice(0, 4).toUpperCase(),
          opponentLogoUrl: p2?.avatar_url ?? null,
          scoreHome: home,
          scoreAway: away,
          matchDate: m.created_at,
          result: result as "WIN" | "DRAW" | "LOSS",
        };
      }),
    ]
      .filter((item) => item.scoreHome !== null && item.scoreAway !== null)
      .sort((a, b) => new Date(b.matchDate ?? 0).getTime() - new Date(a.matchDate ?? 0).getTime())
      .slice(0, 3);

    return recentMatches;
  } catch (error) {
    console.error("[getRecentResults] failed:", error);
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

    if (error || !data) {
      if (error) console.error("[getRunningTournaments] failed:", error);
      return MOCK_RUNNING_TOURNAMENTS;
    }

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
    console.error("[getRunningTournaments] failed:", error);
    return MOCK_RUNNING_TOURNAMENTS;
  }
}

export async function getTopPerformers() {
  try {
    const top = await getTopByPoints("official", 4);
    return top.map((s) => ({
      id: s.playerId,
      slug: s.slug ?? null,
      username: s.username,
      name: s.realName?.trim() || s.username,
      avatarUrl: s.avatarUrl,
      statLabel: "POINTS",
      statValue: String(s.points ?? 0),
      record: `${s.wins}W ${s.draws}D ${s.losses}L · ${s.value} goals`,
    }));
  } catch (error) {
    console.error("[getTopPerformers] failed:", error);
    return [];
  }
}

export async function getAchievements() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("achievements")
      .select("id, title, season")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data) {
      if (error) console.error("[getAchievements] failed:", error);
      return [];
    }

    return data.map((a) => ({
      id: a.id,
      label: a.season ? `${a.title.toUpperCase()} ${a.season}` : a.title.toUpperCase(),
    }));
  } catch (error) {
    console.error("[getAchievements] failed:", error);
    return [];
  }
}

export async function getLatestNews() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("news")
      .select("id, title, category, cover_image_url, published_at")
      .order("published_at", { ascending: false })
      .limit(3);

    if (error || !data) {
      if (error) console.error("[getLatestNews] failed:", error);
      return [];
    }

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
    console.error("[getLatestNews] failed:", error);
    return [];
  }
}

export async function getGallery() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("gallery")
      .select("id, image_url, caption")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data) {
      if (error) console.error("[getGallery] failed:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("[getGallery] failed:", error);
    return [];
  }
}