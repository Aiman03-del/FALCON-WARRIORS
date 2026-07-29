"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { requireAdmin } from "@/app/lib/queries/dashboard";
import { deleteImageKitFiles } from "../supabase/server";
export async function wipeAllData(confirmationPhrase: string) {
  if (confirmationPhrase !== "DELETE ALL DATA") {
    return { ok: false as const, error: "Confirmation phrase did not match." };
  }

  await requireAdmin();

  const admin = createAdminClient();

  // Clean up ImageKit files for the gallery before wiping the table,
  // otherwise the file_ids are gone and the files become orphaned forever.
  const { data: galleryRows, error: galleryFetchError } = await admin
    .from("gallery")
    .select("image_file_id");

  if (galleryFetchError) {
    return {
      ok: false as const,
      error: `Failed while reading gallery for cleanup: ${galleryFetchError.message}`,
    };
  }

  const fileIds = (galleryRows ?? []).map((row) => row.image_file_id);
  // Best-effort - if ImageKit cleanup fails we still proceed with wiping
  // the database, since leaving orphaned remote files is far better than
  // blocking the wipe (and thus the tables staying inconsistent).
  await deleteImageKitFiles(fileIds);

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