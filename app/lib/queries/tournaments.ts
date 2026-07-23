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

  const { data: squadRows } = await supabase
    .from("tournament_squad")
    .select("player_details(id, efootball_username, avatar_url)")
    .eq("tournament_id", id);

  const squad = (squadRows ?? [])
    .map((s: any) => (Array.isArray(s.player_details) ? s.player_details[0] : s.player_details))
    .filter(Boolean);

  const formMap: Record<string, ("W" | "D" | "L")[]> = {};

  const sortedMatches = [...(matches ?? [])]
    .filter((m: any) => m.status === "completed" && m.player1_score !== null && m.player2_score !== null)
    .sort((a: any, b: any) => b.round - a.round || b.match_order - a.match_order);

  for (const m of sortedMatches as any[]) {
    if (!m.player1_id || !m.player2_id) continue;

    const s1 = m.player1_score;
    const s2 = m.player2_score;
    let r1: "W" | "D" | "L";
    let r2: "W" | "D" | "L";

    if (s1 > s2) {
      r1 = "W";
      r2 = "L";
    } else if (s2 > s1) {
      r1 = "L";
      r2 = "W";
    } else {
      r1 = "D";
      r2 = "D";
    }

    if (!formMap[m.player1_id]) formMap[m.player1_id] = [];
    if (!formMap[m.player2_id]) formMap[m.player2_id] = [];
    if (formMap[m.player1_id].length < 5) formMap[m.player1_id].push(r1);
    if (formMap[m.player2_id].length < 5) formMap[m.player2_id].push(r2);
  }

  return { tournament, participants: participants ?? [], matches: matches ?? [], formMap, squad };
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