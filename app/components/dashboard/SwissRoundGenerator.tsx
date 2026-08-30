"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { generateSwissNextRound, computeSwissScores, getPlayedPairs } from "@/app/lib/fixtures/swissSystem";

type Match = {
  round: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
  stage?: string | null;
};

export default function SwissRoundGenerator({
  tournamentId,
  matches,
  allParticipants,
  totalRounds,
  tournamentStatus,
}: {
  tournamentId: string;
  matches: Match[];
  allParticipants: { id: string; username: string; real_name?: string | null }[];
  totalRounds: number;
  tournamentStatus: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swiss = matches.filter((m) => m.stage === "swiss");
  const currentRound = swiss.length ? Math.max(...swiss.map((m) => m.round)) : 0;
  const roundMatches = swiss.filter((m) => m.round === currentRound);
  const roundDone = roundMatches.length > 0 && roundMatches.every((m) => m.status === "completed" || m.status === "bye");

  const scores = computeSwissScores(allParticipants.map((p) => p.id), swiss);
  const ranked = [...allParticipants].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const championId = currentRound >= totalRounds && roundDone ? ranked[0]?.id ?? null : null;

  useEffect(() => {
    if (!championId || tournamentStatus === "completed") return;
    supabase.from("tournaments").update({ status: "completed" }).eq("id", tournamentId).neq("status", "completed").then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [championId, tournamentStatus, tournamentId]);

  if (swiss.length === 0) return null;

  if (championId) {
    const name = allParticipants.find((p) => p.id === championId)?.real_name?.trim() || allParticipants.find((p) => p.id === championId)?.username || "Unknown";
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3">
        <Trophy size={18} className="text-gold" />
        <p className="text-sm font-semibold text-white">Champion: <span className="text-gold">{name}</span> ({scores[championId]} pts)</p>
      </div>
    );
  }

  if (!roundDone || currentRound >= totalRounds) return null;

  async function handleGenerateNext() {
    setError(null); setLoading(true);
    try {
      const alreadyByedIds = new Set(swiss.filter((m) => m.status === "bye" && m.player1_id).map((m) => m.player1_id as string));
      const playedPairs = getPlayedPairs(swiss);
      const drafts = generateSwissNextRound(
        allParticipants.map((p) => ({ id: p.id, username: p.username })),
        scores,
        playedPairs,
        currentRound + 1,
        alreadyByedIds
      );
      const rows = drafts.map((d) => ({
        tournament_id: tournamentId, round: d.round, match_order: d.match_order,
        player1_id: d.player1_id, player2_id: d.player2_id, status: d.status, stage: "swiss",
      }));
      const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
      if (insertError) throw new Error(insertError.message);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate round.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button onClick={handleGenerateNext} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
        {loading ? "Generating..." : `Generate Round ${currentRound + 1} of ${totalRounds}`}
      </button>
      {error && <p className="mt-2 text-xs text-gold">{error}</p>}
    </div>
  );
}