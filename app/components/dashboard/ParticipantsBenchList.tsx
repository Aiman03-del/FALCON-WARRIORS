"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

type SquadPlayer = {
  id: string;
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
  is_benched: boolean;
};

export default function ParticipantsBenchList({
  tournamentId,
  players,
}: {
  tournamentId: string;
  players: SquadPlayer[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function nameOf(player: SquadPlayer) {
    return player.real_name?.trim() || player.efootball_username;
  }

  async function toggleBench(playerId: string, current: boolean) {
    setUpdatingId(playerId);
    await supabase
      .from("tournament_squad")
      .update({ is_benched: !current })
      .eq("tournament_id", tournamentId)
      .eq("player_id", playerId);
    setUpdatingId(null);
    router.refresh();
  }

  const playing = players.filter((p) => !p.is_benched);
  const benched = players.filter((p) => p.is_benched);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">
        Bench a player to exclude them from this round's Squad Battles — they'll stay in the tournament squad but won't get a battle slot until you un-bench them.
      </p>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
          Playing ({playing.length})
        </p>
        <div className="card divide-y divide-border">
          {playing.map((player) => (
            <div key={player.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium">{nameOf(player)}</span>
              <button
                type="button"
                disabled={updatingId === player.id}
                onClick={() => toggleBench(player.id, player.is_benched)}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-gold/40 hover:text-gold disabled:opacity-50"
              >
                Bench
              </button>
            </div>
          ))}
        </div>
      </div>

      {benched.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gold">
            Benched ({benched.length})
          </p>
          <div className="card divide-y divide-border">
            {benched.map((player) => (
              <div key={player.id} className="flex items-center justify-between px-4 py-3 text-sm opacity-70">
                <span className="font-medium line-through">{nameOf(player)}</span>
                <button
                  type="button"
                  disabled={updatingId === player.id}
                  onClick={() => toggleBench(player.id, player.is_benched)}
                  className="rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold transition hover:bg-gold/20 disabled:opacity-50"
                >
                  Un-bench
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}