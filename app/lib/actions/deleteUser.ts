"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";

export async function deleteUserAccount(playerId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Unauthorized" };
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    return { ok: false as const, error: "Forbidden" };
  }

  const { data: target, error: targetError } = await supabase
    .from("player_details")
    .select("id, profile_id, efootball_username")
    .eq("id", playerId)
    .single();

  if (targetError || !target?.profile_id) {
    return { ok: false as const, error: "User not found" };
  }

  if (target.profile_id === user.id) {
    return { ok: false as const, error: "You cannot delete your own account from here." };
  }

  const profileId = target.profile_id;
  const admin = createAdminClient();

  const cleanupSteps = [
    () => admin.from("match_ratings").delete().eq("player_id", playerId),
    () => admin.from("match_events").delete().eq("scorer_id", playerId),
    () => admin.from("match_goal_entries").delete().eq("player_id", playerId),
    () => admin.from("match_squad").delete().eq("player_id", playerId),
    () => admin.from("match_squad_battles").delete().eq("falcon_player_id", playerId),
    () => admin.from("tournament_participants").delete().eq("player_id", playerId),
    () => admin.from("tournament_squad").delete().eq("player_id", playerId),
    () => admin.from("player_stats").delete().eq("player_id", playerId),
    () =>
      admin
        .from("tournament_matches")
        .update({ player1_id: null })
        .eq("player1_id", playerId),
    () =>
      admin
        .from("tournament_matches")
        .update({ player2_id: null })
        .eq("player2_id", playerId),
    () =>
      admin
        .from("tournament_matches")
        .update({ winner_id: null })
        .eq("winner_id", playerId),
    () => admin.from("matches").delete().eq("player1_id", playerId),
    () => admin.from("matches").delete().eq("player2_id", playerId),
    () => admin.from("player_details").delete().eq("id", playerId),
    () => admin.from("profiles").delete().eq("id", profileId),
  ];

  for (const step of cleanupSteps) {
    const { error } = await step();
    if (error) {
      return { ok: false as const, error: error.message };
    }
  }

  const { error: authError } = await admin.auth.admin.deleteUser(profileId);
  if (authError) {
    return { ok: false as const, error: authError.message };
  }

  return { ok: true as const };
}
