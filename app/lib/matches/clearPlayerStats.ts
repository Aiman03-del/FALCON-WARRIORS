import { SupabaseClient } from "@supabase/supabase-js";
import { recalcAllPlayerStats } from "./recalcPlayerStats";

export async function clearPlayerLeaderboardData(supabase: SupabaseClient, playerId: string) {
  await supabase.from("match_squad_battles").delete().eq("falcon_player_id", playerId);
  await supabase.from("match_goal_entries").delete().eq("player_id", playerId);
  await supabase.from("match_events").delete().eq("scorer_id", playerId);
  // Only clear ratings from the standalone "matches" system here — ratings tied
  // to a tournament_match (tournament_match_id set) must survive, since resetting
  // a player's leaderboard data should never touch tournament results/ratings.
  await supabase.from("match_ratings").delete().eq("player_id", playerId).is("tournament_match_id", null);
  await supabase.from("matches").delete().or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`);

  await recalcAllPlayerStats(supabase);
}