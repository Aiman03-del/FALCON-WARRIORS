"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { generateKnockoutNextRound } from "@/app/lib/fixtures/generateFixtures";

type Match = {
  round: number;
  status: string;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
};

export default function NextRoundGenerator({
  tournamentId,
  matches,
  allParticipants,
}: {
  tournamentId: string;
  matches: Match[];
  allParticipants: { id: string; username: string }[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (matches.length === 0) return null;

  const currentRound = Math.max(...matches.map((m) => m.round));
  const roundMatches = matches.filter((m) => m.round === currentRound);
  const allDone = roundMatches.every((m) => m.status === "completed" || m.status === "bye");
  const winners = roundMatches
    .map((m) => (m.status === "bye" ? m.player1_id : m.winner_id))
    .filter((id): id is string => !!id);

  if (!allDone || winners.length < 2) return null;

  async function handleGenerateNext() {
    setError(null);
    setLoading(true);

    const winnerPlayers = winners
      .map((id) => allParticipants.find((p) => p.id === id))
      .filter((p): p is { id: string; username: string } => !!p);

    const drafts = generateKnockoutNextRound(winnerPlayers, currentRound + 1);

    const rows = drafts.map((d) => ({
      tournament_id: tournamentId,
      round: d.round,
      match_order: d.match_order,
      player1_id: d.player1_id,
      player2_id: d.player2_id,
      status: d.status,
    }));

    const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleGenerateNext}
        disabled={loading}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {loading ? "Generating..." : `Generate Round ${currentRound + 1}`}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}