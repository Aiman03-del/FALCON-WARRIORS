"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { requireAdmin } from "@/app/lib/queries/dashboard";

export async function wipeAllData(confirmationPhrase: string) {
  if (confirmationPhrase !== "DELETE ALL DATA") {
    return { ok: false as const, error: "Confirmation phrase did not match." };
  }

  await requireAdmin();

  const admin = createAdminClient();

  const tables = [
    "match_ratings",
    "match_events",
    "match_goal_entries",
    "match_squad_battles",
    "match_squad",
    "matches",
    "tournament_participants",
    "tournament_squad",
    "tournament_matches",
    "tournaments",
    "player_stats",
    "ballon_dor_nominees",
    "awards",
    "achievements",
    "gallery",
    "news",
    "associated_communities",
    "player_details",
  ] as const;

  for (const table of tables) {
    const { error } = await admin.from(table).delete().not("id", "is", null);
    if (error) {
      return { ok: false as const, error: `Failed while clearing "${table}": ${error.message}` };
    }
  }

  return { ok: true as const };
}