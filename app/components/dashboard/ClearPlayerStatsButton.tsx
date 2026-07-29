"use client";

import { useRouter } from "next/navigation";
import { Eraser } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmActionButton from "@/app/components/ConfirmActionButton";
import { clearPlayerLeaderboardData } from "@/app/lib/matches/clearPlayerStats";

export default function ClearPlayerStatsButton({
  playerId,
  username,
}: {
  playerId: string;
  username: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function handleClear() {
    await clearPlayerLeaderboardData(supabase, playerId);
    router.refresh();
  }

  return (
    <ConfirmActionButton
      onConfirm={handleClear}
      confirmTitle="Clear Player Data"
      confirmMessage={`Are you sure you want to permanently clear ${username}'s match, goal, battle, and rating history? This will remove them from the leaderboard and cannot be undone.`}
      confirmText="Yes, Clear Permanently"
      cancelText="Cancel"
      successMessage={`${username}'s leaderboard data has been cleared.`}
      errorMessage="Failed to clear player data. Please try again."
      isDangerous
      ariaLabel={`Clear ${username}'s leaderboard data`}
      buttonClassName="text-muted transition hover:text-red-400 disabled:opacity-50"
    >
      <Eraser size={14} />
    </ConfirmActionButton>
  );
}