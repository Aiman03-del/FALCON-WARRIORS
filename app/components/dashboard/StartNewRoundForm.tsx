"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { ensureSquadBattles } from "@/app/lib/matches/generateSquadBattles";
import FillButton from "../FillButton";

export default function StartNewRoundForm({
  tournamentId,
  falconSquad,
}: {
  tournamentId: string;
  falconSquad: { id: string; efootball_username: string }[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (falconSquad.length === 0) {
      setError("Select a tournament squad first.");
      return;
    }

    setError(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    const { data: newMatch, error: insertError } = await supabase
      .from("matches")
      .insert({
        match_type: "external",
        tournament_id: tournamentId,
        opponent_name: null,
        round_stage: null,
        match_date: new Date().toISOString(),
        status: "live",
        moderator_id: userData.user?.id ?? null,
      })
      .select("id")
      .single();

    if (insertError || !newMatch) {
      setLoading(false);
      setError(insertError?.message ?? "Failed to start round");
      return;
    }

    await ensureSquadBattles(supabase, newMatch.id, falconSquad);

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <p className="font-display text-sm font-bold uppercase tracking-wide text-gold">
        Start New Round
      </p>
      <p className="text-sm text-muted">
        Start a fresh live round for the current Falcon squad. Opponent name and round details can be added later when submitting the squad result.
      </p>

      {error && (
        <p className="rounded-lg bg-gold/15 px-3 py-2 text-sm text-gold">{error}</p>
      )}

      <FillButton onClick={handleStart} disabled={loading}>
        {loading ? "Starting..." : "Start Round"}
      </FillButton>
    </div>
  );
}