import { createClient as createServerClient } from "../supabase/server";
import { createClient } from "../supabase/client";


export async function getAllPlayers() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("player_details")
    .select(
      "id, efootball_username, real_name, avatar_url, preferred_position, platform, rank_division, membership_status"
    )
    .eq("membership_status", "active")
    .order("efootball_username");

  if (error || !data) return [];
  return data;
}

export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data?.role ?? null;
}

export async function getPlayerById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_details")
    .select(
      `id, efootball_username, real_name, age, country, city, supported_club,
       national_team, favorite_player, education, profession, platform,
       preferred_position, rank_division, avatar_url, join_date, membership_status,
       player_stats(goals, assists, matches, wins, draws, losses, motm_count)`
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}
