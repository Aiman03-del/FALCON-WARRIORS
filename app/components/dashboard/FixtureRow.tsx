"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { recalcStandings } from "@/app/lib/fixtures/recalcStandings";

type PlayerOption = { id: string; username: string };

type Match = {
  id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
};

export default function FixtureRow({
  match,
  allParticipants,
  tournamentId,
}: {
  match: Match;
  allParticipants: PlayerOption[];
  tournamentId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [p1, setP1] = useState(match.player1_id ?? "");
  const [p2, setP2] = useState(match.player2_id ?? "");
  const [s1, setS1] = useState(match.player1_score?.toString() ?? "");
  const [s2, setS2] = useState(match.player2_score?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [editingOpponents, setEditingOpponents] = useState(false);

  function nameOf(id: string | null) {
    if (!id) return "— BYE —";
    return allParticipants.find((p) => p.id === id)?.username ?? "Unknown";
  }

  async function handleSaveOpponents() {
    setLoading(true);
    await supabase
      .from("tournament_matches")
      .update({ player1_id: p1 || null, player2_id: p2 || null })
      .eq("id", match.id);
    setLoading(false);
    setEditingOpponents(false);
    router.refresh();
  }

  async function handleSaveResult() {
    if (s1 === "" || s2 === "") return;

    setLoading(true);

    const score1 = Number(s1);
    const score2 = Number(s2);
    const winnerId =
      score1 > score2 ? match.player1_id : score2 > score1 ? match.player2_id : null;

    await supabase
      .from("tournament_matches")
      .update({
        player1_score: score1,
        player2_score: score2,
        winner_id: winnerId,
        status: "completed",
      })
      .eq("id", match.id);

    await recalcStandings(supabase, tournamentId);

    setLoading(false);
    router.refresh();
  }

  if (match.status === "bye") {
    return (
      <div className="card flex items-center justify-between p-4">
        <p className="text-sm font-medium">
          {nameOf(match.player1_id)} <span className="text-muted">— BYE (auto-advance)</span>
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      {editingOpponents ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-muted">Player 1</label>
            <select
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="">— None —</option>
              {allParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.username}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-muted">Player 2</label>
            <select
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="">— None —</option>
              {allParticipants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.username}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSaveOpponents}
            disabled={loading}
            className="btn-primary text-sm disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditingOpponents(false)}
            className="btn-outline text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold">
              {nameOf(match.player1_id)} <span className="text-muted">vs</span>{" "}
              {nameOf(match.player2_id)}
            </p>
            <button
              onClick={() => setEditingOpponents(true)}
              className="flex items-center gap-1 text-xs text-gold hover:text-gold-light"
            >
              <Shuffle size={12} />
              Change
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              className="w-14 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-center text-sm outline-none focus:border-gold"
              placeholder="0"
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              className="w-14 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-center text-sm outline-none focus:border-gold"
              placeholder="0"
            />
            <button
              onClick={handleSaveResult}
              disabled={loading || s1 === "" || s2 === ""}
              className="btn-primary text-xs disabled:opacity-50"
            >
              Save Result
            </button>
          </div>

          {match.status === "completed" && (
            <span className="rounded-full bg-indigo/20 px-2.5 py-1 text-[10px] font-bold uppercase text-indigo-light">
              Completed
            </span>
          )}
        </div>
      )}
    </div>
  );
}