"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmableDeleteButton from "@/app/components/ConfirmableDeleteButton";
import { recalcAllPlayerStats } from "@/app/lib/matches/recalcPlayerStats";

export default function DeleteMatchButton({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    const { error } = await supabase.from("matches").delete().eq("id", id);

    if (error) {
      throw error;
    }

    // Recalc so player_stats / the leaderboard don't keep counting a
    // match that no longer exists.
    try {
      await recalcAllPlayerStats(supabase);
    } catch (recalcError) {
      console.error("Failed to recalc player stats after match delete:", recalcError);
    }

    router.refresh();
  }

  return (
    <ConfirmableDeleteButton onDelete={handleDelete} label="this match">
      <Trash2 size={16} />
    </ConfirmableDeleteButton>
  );
}