import { createClient } from "../supabase/client";

export async function globalSearch(query: string) {
  const supabase = await createClient();
  const q = query.trim();

  if (!q) {
    return { players: [], matches: [], news: [] };
  }

  const [playersRes, matchesRes, newsRes] = await Promise.all([
    supabase
      .from("player_details")
      .select("id, efootball_username, avatar_url, preferred_position")
      .ilike("efootball_username", `%${q}%`)
      .eq("membership_status", "active")
      .limit(8),

    supabase
      .from("matches")
      .select("id, opponent_name, competition, match_date, status, score_home, score_away")
      .or(`opponent_name.ilike.%${q}%,competition.ilike.%${q}%`)
      .order("match_date", { ascending: false })
      .limit(8),

    supabase
      .from("news")
      .select("id, title, category, published_at, cover_image_url")
      .ilike("title", `%${q}%`)
      .order("published_at", { ascending: false })
      .limit(8),
  ]);

  return {
    players: playersRes.data ?? [],
    matches: matchesRes.data ?? [],
    news: newsRes.data ?? [],
  };
}