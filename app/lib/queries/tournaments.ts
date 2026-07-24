import { createClient } from "../supabase/server";
import { calculateStandings, getUpcomingMatches, getCompletedMatches, getPlayerRecentForm } from "../utils/tournament";

// Mock tournament data
const MOCK_TOURNAMENTS = [
  {
    id: "tournament-1",
    name: "Falcon Warriors Championship 2026",
    type: "internal",
    format: "league",
    status: "ongoing",
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 16,
    registration_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tournament-2",
    name: "International Cup 2026",
    type: "external",
    format: "knockout",
    status: "upcoming",
    start_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 8,
    registration_deadline: null,
  },
  {
    id: "tournament-3",
    name: "Spring League Season",
    type: "internal",
    format: "league",
    status: "completed",
    start_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 12,
    registration_deadline: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tournament-4",
    name: "Club Invitational 2026",
    type: "external",
    format: "league",
    status: "upcoming",
    start_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 20,
    registration_deadline: null,
  },
];

export async function getAllTournaments() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tournaments")
      .select("id, name, type, format, status, start_date, end_date, max_participants, registration_deadline")
      .order("start_date", { ascending: false });

    if (error || !data) return MOCK_TOURNAMENTS;
    return data;
  } catch (error) {
    // If Supabase is not available, return mock data
    return MOCK_TOURNAMENTS;
  }
}

// Mock tournament detail data
const MOCK_TOURNAMENT_DETAILS: Record<string, any> = {
  "tournament-1": {
    tournament: MOCK_TOURNAMENTS[0],
    participants: [
      { id: "p1", points: 45, rank: 1, status: "approved", matches_played: 9, wins: 5, draws: 0, losses: 4, goals_for: 18, goals_against: 12, player_details: { id: "player-1", efootball_username: "Ahmed_Pro", avatar_url: "https://via.placeholder.com/40?text=AP" } },
      { id: "p2", points: 42, rank: 2, status: "approved", matches_played: 9, wins: 4, draws: 3, losses: 2, goals_for: 16, goals_against: 10, player_details: { id: "player-2", efootball_username: "Hassan_Elite", avatar_url: "https://via.placeholder.com/40?text=HE" } },
      { id: "p3", points: 39, rank: 3, status: "approved", matches_played: 9, wins: 4, draws: 0, losses: 5, goals_for: 14, goals_against: 15, player_details: { id: "player-3", efootball_username: "Karim_Sharp", avatar_url: "https://via.placeholder.com/40?text=KS" } },
    ],
    matches: [
      { id: "m1", round: 1, match_order: 1, player1_id: "player-1", player2_id: "player-2", player1_score: 2, player2_score: 1, status: "completed", player1: { efootball_username: "Ahmed_Pro" }, player2: { efootball_username: "Hassan_Elite" } },
      { id: "m2", round: 1, match_order: 2, player1_id: "player-3", player2_id: "player-1", player1_score: 1, player2_score: 2, status: "completed", player1: { efootball_username: "Karim_Sharp" }, player2: { efootball_username: "Ahmed_Pro" } },
    ],
    formMap: {
      "player-1": ["W", "W", "D", "L", "W"],
      "player-2": ["L", "W", "W", "D", "W"],
      "player-3": ["D", "L", "W", "W", "L"],
    },
    squad: [
      { id: "player-1", efootball_username: "Ahmed_Pro", avatar_url: "https://via.placeholder.com/40?text=AP" },
      { id: "player-2", efootball_username: "Hassan_Elite", avatar_url: "https://via.placeholder.com/40?text=HE" },
      { id: "player-3", efootball_username: "Karim_Sharp", avatar_url: "https://via.placeholder.com/40?text=KS" },
    ],
  },
};

export async function getTournamentDetail(id: string) {
  try {
    const supabase = await createClient();

    const { data: tournament, error } = await supabase
      .from("tournaments")
      .select("id, name, type, format, status, start_date, end_date, max_participants, registration_deadline")
      .eq("id", id)
      .single();

    if (error || !tournament) return MOCK_TOURNAMENT_DETAILS[id] || null;

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
  } catch (error) {
    // If Supabase is not available, return mock data
    return MOCK_TOURNAMENT_DETAILS[id] || null;
  }
}

export async function getMyJoinStatus(tournamentId: string) {
  try {
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
  } catch (error) {
    // If Supabase is not available, return mock data
    return { loggedIn: false as const };
  }
}

export async function getTournamentStandings(tournamentId: string) {
  try {
    const supabase = await createClient();

    const { data: participants } = await supabase
      .from("tournament_participants")
      .select("id, player_id, points, matches_played, wins, draws, losses, goals_for, goals_against, player_details(id, efootball_username)")
      .eq("tournament_id", tournamentId)
      .eq("status", "approved")
      .order("points", { ascending: false });

    if (!participants) return [];

    return participants.map((p: any) => ({
      ...p,
      playerId: p.player_id,
      matchesPlayed: p.matches_played,
      goalsFor: p.goals_for,
      goalsAgainst: p.goals_against,
      goalDifference: (p.goals_for ?? 0) - (p.goals_against ?? 0),
      player: p.player_details,
    }));
  } catch (error) {
    return [];
  }
}

export async function getTournamentUpcomingMatches(tournamentId: string) {
  try {
    const supabase = await createClient();

    const { data: matches } = await supabase
      .from("tournament_matches")
      .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, status, player1:player1_id(efootball_username), player2:player2_id(efootball_username)")
      .eq("tournament_id", tournamentId)
      .in("status", ["pending", "live"])
      .order("round")
      .order("match_order");

    return matches ?? [];
  } catch (error) {
    return [];
  }
}

export async function getTournamentCompletedMatches(tournamentId: string) {
  try {
    const supabase = await createClient();

    const { data: matches } = await supabase
      .from("tournament_matches")
      .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, status, player1:player1_id(efootball_username), player2:player2_id(efootball_username)")
      .eq("tournament_id", tournamentId)
      .eq("status", "completed")
      .order("round", { ascending: false })
      .order("match_order", { ascending: false });

    return matches ?? [];
  } catch (error) {
    return [];
  }
}
