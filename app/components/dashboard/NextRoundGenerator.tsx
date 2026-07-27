"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
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
  tournamentStatus,
}: {
  tournamentId: string;
  matches: Match[];
  allParticipants: { id: string; username: string }[];
  tournamentStatus: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRound = matches.length > 0 ? Math.max(...matches.map((m) => m.round)) : 0;
  const roundMatches = matches.filter((m) => m.round === currentRound);
  const allDone =
    roundMatches.length > 0 &&
    roundMatches.every((m) => m.status === "completed" || m.status === "bye");
  const winners = roundMatches
    .map((m) => (m.status === "bye" ? m.player1_id : m.winner_id))
    .filter((id): id is string => !!id);

  const championId = allDone && winners.length === 1 ? winners[0] : null;
  const championName = championId
    ? allParticipants.find((p) => p.id === championId)?.username ?? "Unknown"
    : null;

  // ফাইনাল রাউন্ডে একজন বিজয়ী বেরিয়ে এলে টুর্নামেন্ট নিজে থেকেই "completed" হয়ে যাবে —
  // স্টাফকে আর মনে করে স্ট্যাটাস ড্রপডাউন বদলাতে হবে না।
  useEffect(() => {
    if (!championId || tournamentStatus === "completed") return;

    supabase
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", tournamentId)
      .neq("status", "completed")
      .then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [championId, tournamentStatus, tournamentId]);

  if (matches.length === 0) return null;

  if (championId) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3">
        <Trophy size={18} className="text-gold" />
        <p className="text-sm font-semibold text-white">
          Champion: <span className="text-gold">{championName}</span>
        </p>
      </div>
    );
  }

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
      {error && <p className="mt-2 text-xs text-gold">{error}</p>}
    </div>
  );
}