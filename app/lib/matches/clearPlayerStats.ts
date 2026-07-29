import { SupabaseClient } from "@supabase/supabase-js";
import { recalcAllPlayerStats } from "./recalcPlayerStats";

export async function clearPlayerLeaderboardData(supabase: SupabaseClient, playerId: string) {
  await supabase.from("match_squad_battles").delete().eq("falcon_player_id", playerId);
  await supabase.from("match_goal_entries").delete().eq("player_id", playerId);
  await supabase.from("match_events").delete().eq("scorer_id", playerId);
  await supabase.from("match_ratings").delete().eq("player_id", playerId);
  await supabase.from("matches").delete().or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`);

  await recalcAllPlayerStats(supabase);
}