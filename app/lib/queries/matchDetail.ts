import { createClient } from "../supabase/server";

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

    if (error || !match) return null;

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
    return null;
  }
}
