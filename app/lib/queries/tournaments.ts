import { createClient } from "../supabase/server";

export async function getAllTournaments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tournaments")
    .select("id, name, type, format, status, start_date, end_date, max_participants, registration_deadline")
    .order("start_date", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getTournamentDetail(id: string) {
  const supabase = await createClient();

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("id, name, type, format, status, start_date, end_date, max_participants, registration_deadline")
    .eq("id", id)
    .single();

  if (error || !tournament) return null;

  const { data: participants } = await supabase
    .from("tournament_participants")
    .select(
      "id, points, rank, status, matches_played, wins, draws, losses, goals_for, goals_against, player_details(id, efootball_username, avatar_url)"
    )
    .eq("tournament_id", id)
    .eq("status", "approved");

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, status, player1:player1_id(efootball_username), player2:player2_id(efootball_username)")
    .eq("tournament_id", id)
    .order("round")
    .order("match_order");

  return { tournament, participants: participants ?? [], matches: matches ?? [] };
}

export async function getMyJoinStatus(tournamentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { loggedIn: false as const };

  const { data: player } = await supabase
    .from("player_details")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!player) return { loggedIn: true as const, hasPlayerProfile: false as const };

  const { data: existing } = await supabase
    .from("tournament_participants")
    .select("id, status")
    .eq("tournament_id", tournamentId)
    .eq("player_id", player.id)
    .maybeSingle();

  const { count: approvedCount } = await supabase
    .from("tournament_participants")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  return {
    loggedIn: true as const,
    hasPlayerProfile: true as const,
    playerId: player.id,
    myRequestStatus: existing?.status ?? null,
    approvedCount: approvedCount ?? 0,
  };
}