import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
export async function getMyProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  const { data: playerDetails, error } = await supabase
    .from("player_details")
    .select(
      `id, profile_id, efootball_username, real_name, age, country, city,
       supported_club, national_team, favorite_player, education, profession,
       platform, rank_division, avatar_url, join_date,
       membership_status, player_stats(goals, assists, matches, wins, draws, losses, motm_count)`
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  const metadata = (user.user_metadata ?? {}) as Record<string, any>;
  const googleName =
    metadata.full_name ||
    metadata.name ||
    metadata.real_name ||
    "";
  const googleAvatar =
    metadata.avatar_url ||
    metadata.picture ||
    "";

  if (error && error.code !== "PGRST116") {
    console.error("[profile-debug] playerDetails error:", error);
  }

  // If no player_details row exists yet, seed it from user_metadata (registration data)
  if (!playerDetails && !error) {
    const seedPayload = {
      profile_id: user.id,
      efootball_username: metadata.efootball_username || user.email?.split("@")[0] || "Player",
      real_name: googleName || null,
      country: metadata.country || null,
      city: metadata.city || null,
      supported_club: metadata.supported_club || null,
      national_team: metadata.national_team || null,
      platform: metadata.platform || null,
      avatar_url: googleAvatar || null,
    };
    const { error: seedError } = await supabase
      .from("player_details")
      .insert(seedPayload);
    if (seedError) {
      console.error("[profile-debug] seed insert error:", seedError);
    }
  }

  return {
    id: playerDetails?.id ?? "",
    profile_id: playerDetails?.profile_id ?? user.id,
    efootball_username: playerDetails?.efootball_username || metadata.efootball_username || user.email?.split("@")[0] || "Player",
    real_name: playerDetails?.real_name || googleName || null,
    age: playerDetails?.age ?? metadata.age ?? null,
    country: playerDetails?.country || metadata.country || null,
    city: playerDetails?.city || metadata.city || null,
    supported_club: playerDetails?.supported_club || metadata.supported_club || null,
    national_team: playerDetails?.national_team || metadata.national_team || null,
    favorite_player: playerDetails?.favorite_player || metadata.favorite_player || null,
    education: playerDetails?.education || metadata.education || null,
    profession: playerDetails?.profession || metadata.profession || null,
    platform: playerDetails?.platform || metadata.platform || null,
    rank_division: playerDetails?.rank_division || metadata.rank_division || null,
    avatar_url: playerDetails?.avatar_url || googleAvatar || null,
    join_date: playerDetails?.join_date || metadata.join_date || null,
    membership_status: playerDetails?.membership_status || metadata.membership_status || null,
    player_stats: playerDetails?.player_stats ?? null,
  };
}
export async function getPlayerBySlug(slug: string) {
  const supabase = await createClient();

  const { data: playerDetails, error } = await supabase
    .from("player_details")
    .select(
      `id, profile_id, slug, efootball_username, real_name, age, country, city,
       supported_club, national_team, favorite_player, education, profession,
       platform, rank_division, avatar_url, join_date,
       membership_status, is_academic_player,
       player_stats(goals, assists, matches, wins, draws, losses, motm_count),
       profiles(role)`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[profile-debug] getPlayerBySlug error:", error);
  }

  if (!playerDetails) return null;

  const role = Array.isArray(playerDetails.profiles)
    ? playerDetails.profiles[0]?.role ?? "player"
    : (playerDetails.profiles as { role: string } | null)?.role ?? "player";

  return {
    id: playerDetails.id,
    profile_id: playerDetails.profile_id,
    slug: playerDetails.slug,
    efootball_username: playerDetails.efootball_username,
    real_name: playerDetails.real_name,
    age: playerDetails.age,
    country: playerDetails.country,
    city: playerDetails.city,
    supported_club: playerDetails.supported_club,
    national_team: playerDetails.national_team,
    favorite_player: playerDetails.favorite_player,
    education: playerDetails.education,
    profession: playerDetails.profession,
    platform: playerDetails.platform,
    rank_division: playerDetails.rank_division,
    avatar_url: playerDetails.avatar_url,
    join_date: playerDetails.join_date,
    membership_status: playerDetails.membership_status,
    is_academic_player: playerDetails.is_academic_player,
    player_stats: playerDetails.player_stats,
    role,
  };
}