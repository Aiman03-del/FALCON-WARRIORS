import { createClient } from "../supabase/server";

// Mock match details
const MOCK_MATCH_DETAILS: Record<string, any> = {
  "ext-3": {
    match: {
      id: "ext-3",
      match_type: "external",
      opponent_name: "Tiger Squad",
      opponent_tag: "TGR",
      opponent_logo_url: "https://via.placeholder.com/40?text=TGR",
      competition: "International League",
      round_stage: "Group Stage",
      match_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      score_home: 3,
      score_away: 1,
      tournament_id: null,
      player1: null,
      player2: null,
      tournament: null,
    },
    playedBy: { id: "player-1", efootball_username: "Ahmed_Pro", avatar_url: "https://via.placeholder.com/40?text=AP" },
    goalEntries: [
      { player_id: "p1", goals: 2, efootball_username: "Ahmed_Pro" },
      { player_id: "p2", goals: 1, efootball_username: "Hassan_Elite" },
    ],
    motmName: "Ahmed_Pro",
  },
  "int-2": {
    match: {
      id: "int-2",
      match_type: "internal",
      opponent_name: "Karim vs Bilal",
      opponent_tag: "INT",
      opponent_logo_url: null,
      competition: "Internal Championship",
      round_stage: "Round 5",
      match_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      score_home: 2,
      score_away: 1,
      tournament_id: "tournament-1",
      player1: { id: "player-3", efootball_username: "Karim_Sharp", avatar_url: "https://via.placeholder.com/40?text=KS" },
      player2: { id: "player-4", efootball_username: "Bilal_Speed", avatar_url: "https://via.placeholder.com/40?text=BS" },
      tournament: { id: "tournament-1", name: "Falcon Warriors Championship 2026" },
    },
    playedBy: null,
    goalEntries: [],
    motmName: "Karim_Sharp",
  },
};

export async function getMatchDetail(id: string) {
  try {
    const supabase = await createClient();

    const { data: match, error } = await supabase
      .from("matches")
      .select(
        `id, match_type, opponent_name, opponent_tag, opponent_logo_url, competition, round_stage,
         match_date, status, score_home, score_away, tournament_id,
         player1_id, player2_id,
         player1:player1_id(id, efootball_username, avatar_url),
         player2:player2_id(id, efootball_username, avatar_url),
         tournament:tournament_id(id, name)`
      )
      .eq("id", id)
      .single();

    if (error || !match) return MOCK_MATCH_DETAILS[id] || null;

    let playedBy: { id: string; efootball_username: string; avatar_url: string | null } | null = null;
    let goalEntries: { player_id: string; goals: number; efootball_username: string }[] = [];

    if (match.match_type === "external") {
      const { data: squadRow } = await supabase
        .from("match_squad")
        .select("player_details(id, efootball_username, avatar_url)")
        .eq("match_id", id)
        .maybeSingle();

      if (squadRow?.player_details) {
        playedBy = Array.isArray(squadRow.player_details)
          ? squadRow.player_details[0]
          : squadRow.player_details;
      }

      const { data: goalRows } = await supabase
        .from("match_goal_entries")
        .select("player_id, goals, player_details(efootball_username)")
        .eq("match_id", id);

      goalEntries = (goalRows ?? []).map((g: any) => ({
        player_id: g.player_id,
        goals: g.goals,
        efootball_username: Array.isArray(g.player_details)
          ? g.player_details[0]?.efootball_username
          : g.player_details?.efootball_username,
      }));
    }

    const { data: motmRow } = await supabase
      .from("match_events")
      .select("player_details:scorer_id(efootball_username)")
      .eq("match_id", id)
      .eq("event_type", "motm")
      .maybeSingle();

    const motmName = motmRow?.player_details
      ? Array.isArray(motmRow.player_details)
        ? motmRow.player_details[0]?.efootball_username
        : (motmRow.player_details as any)?.efootball_username
      : null;

    return { match, playedBy, goalEntries, motmName };
  } catch (error) {
    // If Supabase is not available, return mock data
    return MOCK_MATCH_DETAILS[id] || null;
  }
}
