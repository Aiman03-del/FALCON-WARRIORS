"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { generateKnockoutNextRound } from "@/app/lib/fixtures/generateFixtures";
import { groupIntoTies, tieWinnerId, tieIsDone } from "@/app/lib/fixtures/twoLegKnockout";

type Match = {
  round: number;
  match_order: number;
  status: string;
  player1_id: string | null;
  player2_id: string | null;
  player1_score?: number | null;
  player2_score?: number | null;
  winner_id: string | null;
  stage?: string | null;
  leg?: number | null;
};

export default function NextRoundGenerator({
  tournamentId,
  matches,
  allParticipants,
  tournamentStatus,
  byeMethod = "seed",
  thirdPlaceMatch = false,
  twoLegKnockout = false, // নতুন
}: {
  tournamentId: string;
  matches: Match[];
  allParticipants: { id: string; username: string; real_name?: string | null }[];
  tournamentStatus: string;
  byeMethod?: "seed" | "random";
  thirdPlaceMatch?: boolean;
  twoLegKnockout?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const knockoutMatches = matches.filter((m) => m.stage === "knockout" || m.stage == null);
  const currentRound = knockoutMatches.length > 0 ? Math.max(...knockoutMatches.map((m) => m.round)) : 0;
  const roundRows = knockoutMatches.filter((m) => m.round === currentRound && !("is_third_place" in m && (m as any).is_third_place));
  const roundTies = groupIntoTies(
    roundRows.map((m) => ({ ...m, id: `${m.round}-${m.match_order}-${m.leg ?? 1}` })) as any
  ).sort((a, b) => a.match_order - b.match_order);

  const allDone = roundTies.length > 0 && roundTies.every(tieIsDone);
  const winners = roundTies.map(tieWinnerId).filter((id): id is string => !!id);

  const championId = allDone && winners.length === 1 ? winners[0] : null;
  const championName = championId
    ? allParticipants.find((p) => p.id === championId)?.real_name?.trim() ||
      allParticipants.find((p) => p.id === championId)?.username ||
      "Unknown"
    : null;

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

  if (knockoutMatches.length === 0) return null;

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

    const alreadyByedIds = new Set(
      matches.filter((m) => m.status === "bye" && m.player1_id).map((m) => m.player1_id as string)
    );

    const drafts = generateKnockoutNextRound(winnerPlayers, currentRound + 1, alreadyByedIds, twoLegKnockout);

    const rows = drafts.map((d) => ({
      tournament_id: tournamentId,
      round: d.round,
      match_order: d.match_order,
      player1_id: d.player1_id,
      player2_id: d.player2_id,
      status: d.status,
      stage: "knockout",
      is_third_place: false,
      leg: d.leg ?? 1,
      tie_id: d.tie_id ?? null,
    }));

    // থার্ড প্লেস ম্যাচ — সবসময় সিঙ্গেল-লেগ (২-লেগ চালু থাকলেও)
    if (thirdPlaceMatch && winners.length === 2 && roundTies.length === 2) {
      const losers = roundTies
        .filter((t) => tieIsDone(t))
        .map((t) => {
          const w = tieWinnerId(t);
          const allIds = new Set(t.legs.flatMap((l) => [l.player1_id, l.player2_id]).filter(Boolean));
          allIds.delete(w as string);
          return Array.from(allIds)[0] as string | undefined;
        })
        .filter((id): id is string => !!id);

      if (losers.length === 2) {
        rows.push({
          tournament_id: tournamentId,
          round: currentRound + 1,
          match_order: Math.max(...drafts.map((d) => d.match_order)) + 1,
          player1_id: losers[0],
          player2_id: losers[1],
          status: "scheduled",
          stage: "knockout",
          is_third_place: true,
          leg: 1,
          tie_id: null,
        });
      }
    }

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
      <button onClick={handleGenerateNext} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
        {loading ? "Generating..." : `Generate Round ${currentRound + 1}`}
      </button>
      {error && <p className="mt-2 text-xs text-gold">{error}</p>}
    </div>
  );
}