"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmableDeleteButton from "@/app/components/ConfirmableDeleteButton";
import { recalcAllPlayerStats } from "@/app/lib/matches/recalcPlayerStats";

export default function DeleteTournamentButton({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted?: (id: string) => void;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);

    if (error) {
      throw error;
    }

    // The tournament's matches are gone now (cascaded), but player_stats
    // and leaderboard numbers were computed from them — recalc so profiles
    // and the leaderboard don't keep showing stats from a deleted tournament.
    try {
      await recalcAllPlayerStats(supabase);
    } catch (recalcError) {
      console.error("Failed to recalc player stats after tournament delete:", recalcError);
    }

    onDeleted?.(id);
    router.refresh();
  }

  return (
    <ConfirmableDeleteButton onDelete={handleDelete} label="this tournament">
      <Trash2 size={16} />
    </ConfirmableDeleteButton>
  );
}