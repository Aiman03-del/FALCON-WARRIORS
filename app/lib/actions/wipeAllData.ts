"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { requireAdmin } from "@/app/lib/queries/dashboard";

// Deletes all content data across the site (players, matches, tournaments,
// news, gallery, achievements, awards, communities). Auth accounts and
// `profiles` rows are intentionally left untouched so nobody gets locked out.
export async function wipeAllData(confirmationPhrase: string) {
  if (confirmationPhrase !== "DELETE ALL DATA") {
    return { ok: false as const, error: "Confirmation phrase did not match." };
  }

  await requireAdmin();

  const admin = createAdminClient();

  // Children first, then parents, to respect foreign key constraints.
  const steps: { table: string; run: () => Promise<{ error: { message: string } | null }> }[] = [
    { table: "match_ratings", run: () => admin.from("match_ratings").delete().not("id", "is", null) },
    { table: "match_events", run: () => admin.from("match_events").delete().not("id", "is", null) },
    { table: "match_goal_entries", run: () => admin.from("match_goal_entries").delete().not("id", "is", null) },
    { table: "match_squad_battles", run: () => admin.from("match_squad_battles").delete().not("id", "is", null) },
    { table: "match_squad", run: () => admin.from("match_squad").delete().not("id", "is", null) },
    { table: "matches", run: () => admin.from("matches").delete().not("id", "is", null) },
    { table: "tournament_participants", run: () => admin.from("tournament_participants").delete().not("id", "is", null) },
    { table: "tournament_squad", run: () => admin.from("tournament_squad").delete().not("id", "is", null) },
    { table: "tournament_matches", run: () => admin.from("tournament_matches").delete().not("id", "is", null) },
    { table: "tournaments", run: () => admin.from("tournaments").delete().not("id", "is", null) },
    { table: "player_stats", run: () => admin.from("player_stats").delete().not("id", "is", null) },
    { table: "ballon_dor_nominees", run: () => admin.from("ballon_dor_nominees").delete().not("id", "is", null) },
    { table: "awards", run: () => admin.from("awards").delete().not("id", "is", null) },
    { table: "achievements", run: () => admin.from("achievements").delete().not("id", "is", null) },
    { table: "gallery", run: () => admin.from("gallery").delete().not("id", "is", null) },
    { table: "news", run: () => admin.from("news").delete().not("id", "is", null) },
    { table: "associated_communities", run: () => admin.from("associated_communities").delete().not("id", "is", null) },
    { table: "player_details", run: () => admin.from("player_details").delete().not("id", "is", null) },
  ];

  for (const step of steps) {
    const { error } = await step.run();
    if (error) {
      return { ok: false as const, error: `Failed while clearing "${step.table}": ${error.message}` };
    }
  }

  return { ok: true as const };
}