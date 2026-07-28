import { createClient } from "../supabase/server";
import { rankStandings } from "../fixtures/tiebreakers";

export async function getTournamentDetail(id: string) {
  const supabase = await createClient();

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(
      "id, name, type, format, status, start_date, end_date, max_participants, registration_deadline, group_count, qualifiers_per_group, playoff_size, third_place_match"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!tournament) return null;

  const { data: participants } = await supabase
    .from("tournament_participants")
    .select(
      "id, group_name, points, rank, status, matches_played, wins, draws, losses, goals_for, goals_against, manual_rank, player_details(id, efootball_username, avatar_url)"
    )
    .eq("tournament_id", id)
    .eq("status", "approved");

  const { data: matches } = await supabase
    .from("tournament_matches")
    .select(
      "id, round, match_order, player1_id, player2_id, player1_score, player2_score, status, stage, group_name, is_third_place, player1:player1_id(efootball_username, avatar_url), player2:player2_id(efootball_username, avatar_url)"
    )
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

  const { data: player, error: playerError } = await supabase
    .from("player_details")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (playerError) throw playerError;
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

export async function getTournamentStandings(tournamentId: string) {
  const supabase = await createClient();

  const { data: participants, error } = await supabase
    .from("tournament_participants")
    .select("id, player_id, points, matches_played, wins, draws, losses, goals_for, goals_against, manual_rank, player_details(id, efootball_username)")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (error) throw error;
  if (!participants) return [];

  // Only league-stage results should decide league standings (knockout-stage
  // results settle elimination, not the table) — same rule recalcStandings uses.
  // Filtering in JS (not via .neq("stage", ...)) avoids Postgres's NULL !=
  // three-valued-logic silently excluding older rows with a null stage.
  const { data: rawMatches } = await supabase
    .from("tournament_matches")
    .select("player1_id, player2_id, player1_score, player2_score, status, stage")
    .eq("tournament_id", tournamentId)
    .eq("status", "completed");

  const matches = (rawMatches ?? []).filter((m) => m.stage !== "knockout");

  const withComputed = participants.map((p: any) => ({
    ...p,
    playerId: p.player_id,
    matchesPlayed: p.matches_played,
    goalsFor: p.goals_for,
    goalsAgainst: p.goals_against,
    goalDifference: (p.goals_for ?? 0) - (p.goals_against ?? 0),
    player: p.player_details,
  }));

  return rankStandings(withComputed, matches ?? []);
}

// For group_knockout tournaments: returns each group's participants, ranked
// (1st place first) using the same tiebreak order as the points table
// (points → goal difference → goals scored). Used both to display group
// tables and to seed the knockout stage once every group match is done.
export async function getGroupStandings(tournamentId: string) {
  const supabase = await createClient();

  const { data: participants, error } = await supabase
    .from("tournament_participants")
    .select(
      "id, player_id, group_name, points, matches_played, wins, draws, losses, goals_for, goals_against, manual_rank, player_details(id, efootball_username, avatar_url)"
    )
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (error) throw error;

  const { data: rawMatches } = await supabase
    .from("tournament_matches")
    .select("player1_id, player2_id, player1_score, player2_score, status, stage, group_name")
    .eq("tournament_id", tournamentId)
    .eq("status", "completed");

  const groups: Record<string, any[]> = {};
  for (const p of participants ?? []) {
    const key = p.group_name ?? "Ungrouped";
    (groups[key] ??= []).push(p);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, rows]) => {
      const groupMatches = (rawMatches ?? []).filter(
        (m) => m.stage === "group" && m.group_name === groupName
      );
      return { groupName, standings: rankStandings(rows, groupMatches) };
    });
}

export async function getTournamentUpcomingMatches(tournamentId: string) {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("tournament_matches")
    .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, status, player1:player1_id(efootball_username, avatar_url), player2:player2_id(efootball_username, avatar_url)")
      .eq("tournament_id", tournamentId)
      .in("status", ["pending", "live"])
      .order("round")
      .order("match_order");

  if (error) throw error;
  return matches ?? [];
}

export async function getTournamentCompletedMatches(tournamentId: string) {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("tournament_matches")
    .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, status, player1:player1_id(efootball_username, avatar_url), player2:player2_id(efootball_username, avatar_url)")
      .eq("tournament_id", tournamentId)
      .eq("status", "completed")
      .order("round", { ascending: false })
      .order("match_order", { ascending: false });

  if (error) throw error;
  return matches ?? [];
}
