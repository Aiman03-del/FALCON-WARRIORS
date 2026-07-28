import { SupabaseClient } from "@supabase/supabase-js";

export async function ensureSquadBattles(
  supabase: SupabaseClient,
  matchId: string,
  falconSquad: { id: string; efootball_username: string }[]
) {
  const { data: existing } = await supabase
    .from("match_squad_battles")
    .select("id")
    .eq("match_id", matchId);

  if (existing && existing.length > 0) return; // already generated

  const rows = falconSquad.map((p, idx) => ({
    match_id: matchId,
    falcon_player_id: p.id,
    opponent_label: `Opponent ${idx + 1}`,
    battle_order: idx + 1,
  }));

  if (rows.length > 0) {
    await supabase.from("match_squad_battles").insert(rows);
  }
}
