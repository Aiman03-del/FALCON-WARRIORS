"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { generateWinnersNextRound, generateLosersRound, generateGrandFinal, generateGrandFinalReset } from "@/app/lib/fixtures/doubleElimination";

type Match = {
  round: number;
  match_order: number;
  status: string;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  bracket_side?: string | null;
};

function winnerIdOf(m: Match): string | null {
  if (m.status === "bye") return m.player1_id;
  if (m.status !== "completed" || m.player1_score == null || m.player2_score == null) return null;
  if (m.player1_score > m.player2_score) return m.player1_id;
  if (m.player2_score > m.player1_score) return m.player2_id;
  return null;
}
function loserIdOf(m: Match): string | null {
  if (m.status !== "completed" || m.player1_score == null || m.player2_score == null) return null;
  if (m.player1_score > m.player2_score) return m.player2_id;
  if (m.player2_score > m.player1_score) return m.player1_id;
  return null;
}

export default function DoubleEliminationController({
  tournamentId,
  matches,
  allParticipants,
  grandFinalReset = true,
}: {
  tournamentId: string;
  matches: Match[];
  allParticipants: { id: string; username: string }[];
  grandFinalReset?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wb = matches.filter((m) => m.bracket_side === "winners");
  const lb = matches.filter((m) => m.bracket_side === "losers");
  const gf = matches.filter((m) => m.bracket_side === "grand_final");

  const wbCurrentRound = wb.length ? Math.max(...wb.map((m) => m.round)) : 0;
  const wbRoundMatches = wb.filter((m) => m.round === wbCurrentRound);
  const wbRoundDone = wbRoundMatches.length > 0 && wbRoundMatches.every((m) => m.status === "completed" || m.status === "bye");
  const wbWinners = wbRoundMatches.map(winnerIdOf).filter((id): id is string => !!id);
  const wbChampionId = wbRoundDone && wbWinners.length === 1 ? wbWinners[0] : null;

  const lbCurrentRound = lb.length ? Math.max(...lb.map((m) => m.round)) : 0;
  const lbRoundMatches = lb.filter((m) => m.round === lbCurrentRound);
  const lbRoundDone = lb.length === 0 || (lbRoundMatches.length > 0 && lbRoundMatches.every((m) => m.status === "completed" || m.status === "bye"));
  const lbSurvivors = lbRoundMatches.map(winnerIdOf).filter((id): id is string => !!id);
  const lbChampionId = lbRoundDone && lb.length > 0 && lbSurvivors.length === 1 ? lbSurvivors[0] : null;

  // WB round-এর মধ্যে যেসব লুজার এখনো LB-তে ঢোকেনি
  const mergedLBIds = new Set(lb.flatMap((m) => [m.player1_id, m.player2_id]).filter(Boolean) as string[]);
  const unmergedLosers = wb
    .filter((m) => m.status === "completed")
    .map(loserIdOf)
    .filter((id): id is string => !!id && !mergedLBIds.has(id));

  const findP = (id: string) => allParticipants.find((p) => p.id === id);

  function idsToParticipants(ids: string[]) {
    return ids.map((id) => findP(id)).filter((p): p is { id: string; username: string } => !!p);
  }

  async function insertRows(rows: any[]) {
    const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
    if (insertError) throw new Error(insertError.message);
  }

  async function advanceWinners() {
    setError(null); setLoading(true);
    try {
      const players = idsToParticipants(wbWinners);
      const drafts = generateWinnersNextRound(players, wbCurrentRound + 1);
      await insertRows(drafts.map((d) => ({
        tournament_id: tournamentId, round: d.round, match_order: d.match_order,
        player1_id: d.player1_id, player2_id: d.player2_id, status: d.status,
        stage: "knockout", bracket_side: "winners",
      })));
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function advanceLosers() {
    setError(null); setLoading(true);
    try {
      const pool = idsToParticipants(lbSurvivors.length ? lbSurvivors : (lb.length === 0 ? [] : lbSurvivors));
      const newLosers = idsToParticipants(unmergedLosers);
      const nextLBRound = lbCurrentRound + 1;
      const drafts = generateLosersRound(pool, newLosers, nextLBRound);
      await insertRows(drafts.map((d) => ({
        tournament_id: tournamentId, round: d.round, match_order: d.match_order,
        player1_id: d.player1_id, player2_id: d.player2_id, status: d.status,
        stage: "knockout", bracket_side: "losers",
      })));
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function startGrandFinal() {
    if (!wbChampionId || !lbChampionId) return;
    setError(null); setLoading(true);
    try {
      const wbP = findP(wbChampionId)!;
      const lbP = findP(lbChampionId)!;
      const draft = generateGrandFinal(wbP, lbP, 1);
      await insertRows([{
        tournament_id: tournamentId, round: draft.round, match_order: draft.match_order,
        player1_id: draft.player1_id, player2_id: draft.player2_id, status: draft.status,
        stage: "knockout", bracket_side: "grand_final",
      }]);
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  const gfGame1 = gf.find((m) => m.round === 1);
  const gfGame2 = gf.find((m) => m.round === 2);

  async function maybeStartReset() {
    if (!gfGame1 || gfGame1.status !== "completed" || !wbChampionId || !lbChampionId) return;
    const winner = winnerIdOf(gfGame1);
    if (winner !== lbChampionId) return; // WB champion won game 1 → tournament over, no reset needed
    if (!grandFinalReset || gfGame2) return;

    setError(null); setLoading(true);
    try {
      const wbP = findP(wbChampionId)!;
      const lbP = findP(lbChampionId)!;
      const draft = generateGrandFinalReset(wbP, lbP, 2);
      await insertRows([{
        tournament_id: tournamentId, round: draft.round, match_order: draft.match_order,
        player1_id: draft.player1_id, player2_id: draft.player2_id, status: draft.status,
        stage: "knockout", bracket_side: "grand_final",
      }]);
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  // চ্যাম্পিয়ন নির্ধারণ
  let overallChampionId: string | null = null;
  if (gfGame2 && gfGame2.status === "completed") overallChampionId = winnerIdOf(gfGame2);
  else if (gfGame1 && gfGame1.status === "completed" && winnerIdOf(gfGame1) === wbChampionId) overallChampionId = wbChampionId;

  if (overallChampionId) {
    const name = findP(overallChampionId)?.username ?? "Unknown";
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3">
        <Trophy size={18} className="text-gold" />
        <p className="text-sm font-semibold text-white">Champion: <span className="text-gold">{name}</span></p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {wbRoundDone && wbWinners.length > 1 && (
        <button onClick={advanceWinners} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
          Advance Winners Bracket (Round {wbCurrentRound + 1})
        </button>
      )}
      {lbRoundDone && (unmergedLosers.length > 0 || lbSurvivors.length > 1) && !lbChampionId && (
        <button onClick={advanceLosers} disabled={loading} className="btn-outline text-sm disabled:opacity-50">
          Advance Losers Bracket (Round {lbCurrentRound + 1})
        </button>
      )}
      {wbChampionId && lbChampionId && gf.length === 0 && (
        <button onClick={startGrandFinal} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
          Start Grand Final
        </button>
      )}
      {gfGame1 && gfGame1.status === "completed" && winnerIdOf(gfGame1) === lbChampionId && grandFinalReset && !gfGame2 && (
        <button onClick={maybeStartReset} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
          Start Grand Final Reset (Game 2)
        </button>
      )}
      {error && <p className="w-full text-xs text-gold">{error}</p>}
    </div>
  );
}