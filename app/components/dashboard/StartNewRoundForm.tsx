"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { ensureSquadBattles } from "@/app/lib/matches/generateSquadBattles";
import FillButton from "../FillButton";

type SquadPlayer = {
  id: string;
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
};

export default function StartNewRoundForm({
  tournamentId,
  falconSquad,
}: {
  tournamentId: string;
  falconSquad: SquadPlayer[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [benchedIds, setBenchedIds] = useState<string[]>([]);

  function nameOf(player: SquadPlayer) {
    return player.real_name?.trim() || player.efootball_username;
  }

  function toggleBench(playerId: string) {
    setBenchedIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  }

  const playingSquad = falconSquad.filter((p) => !benchedIds.includes(p.id));

  async function handleStart() {
    if (falconSquad.length === 0) {
      setError("Select a tournament squad first.");
      return;
    }

    if (playingSquad.length === 0) {
      setError("At least one player must be on the pitch (not benched).");
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

    // শুধু বেঞ্চে না থাকা প্লেয়ারদের নিয়ে squad battle তৈরি হবে
    await ensureSquadBattles(supabase, newMatch.id, playingSquad);

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <p className="font-display text-sm font-bold uppercase tracking-wide text-gold">
        Start New Round
      </p>
      <p className="text-sm text-muted">
        Select which squad members are on the bench this round. Everyone else will play and get a squad battle slot.
      </p>

      {falconSquad.length === 0 ? (
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">
          No tournament squad selected yet.
        </p>
      ) : (
        <div className="rounded-xl border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Squad ({falconSquad.length})
            </p>
            <p className="text-xs text-muted">
              Playing: <span className="font-semibold text-white">{playingSquad.length}</span> ·
              Benched: <span className="font-semibold text-gold">{benchedIds.length}</span>
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {falconSquad.map((player) => {
              const benched = benchedIds.includes(player.id);

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => toggleBench(player.id)}
                  className={`flex w-full items-center justify-between border-b border-border/60 px-4 py-2.5 text-left text-sm transition-colors last:border-b-0 hover:bg-surface-2 ${
                    benched ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-surface-2">
                      {player.avatar_url ? (
                        <img
                          src={player.avatar_url}
                          alt={nameOf(player)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-muted">
                          {nameOf(player).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className={benched ? "text-muted line-through" : "text-white"}>
                      {nameOf(player)}
                    </span>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      benched
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-border text-muted"
                    }`}
                  >
                    {benched ? "Benched" : <span className="flex items-center gap-1"><Check size={11} /> Playing</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-gold/15 px-3 py-2 text-sm text-gold">{error}</p>
      )}

      <FillButton onClick={handleStart} disabled={loading || falconSquad.length === 0}>
        {loading ? "Starting..." : `Start Round (${playingSquad.length} playing)`}
      </FillButton>
    </div>
  );
}