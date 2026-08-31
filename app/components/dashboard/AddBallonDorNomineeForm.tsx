"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, UserPlus } from "lucide-react";
import SearchableSelect from "@/app/components/SearchableSelect";
import { createClient } from "@/app/lib/supabase/client";

type PlayerOption = { id: string; username: string; realName: string | null };
type TopPlayer = { playerId: string; username: string; realName: string | null; points: number };
type ExistingNomineeRow = { player_id: string };

export default function AddBallonDorNomineeForm({
  allPlayers,
  topByPoints,
}: {
  allPlayers: PlayerOption[];
  topByPoints: TopPlayer[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerOptions = allPlayers.map((p) => ({
    value: p.id,
    label: p.realName?.trim() || p.username,
  }));

  async function insertNominees(playerIds: string[]) {
    // এই বছরের যাদের আগে থেকেই নমিনেট করা আছে, তাদের বাদ দিয়ে বাকিদের অ্যাড করে
    const { data: existing } = await supabase
      .from("ballon_dor_nominees")
      .select("player_id")
      .eq("year", year);

    const existingIds = new Set((existing as ExistingNomineeRow[] | null ?? []).map((r) => r.player_id));
    const toInsert = playerIds.filter((id) => !existingIds.has(id));

    if (toInsert.length === 0) return 0;

    const { error: insertError } = await supabase
      .from("ballon_dor_nominees")
      .insert(toInsert.map((player_id) => ({ player_id, year, is_winner: false })));

    if (insertError) throw new Error(insertError.message);
    return toInsert.length;
  }

  async function handleAutoNominate() {
    setAutoLoading(true);
    setError(null);
    setMessage(null);

    try {
      const added = await insertNominees(topByPoints.map((p) => p.playerId));
      setMessage(
        added > 0
          ? `${added} player(s) added from the Top 10 points leaderboard for ${year}.`
          : `Top 10 players for ${year} are already nominated — nothing new to add.`
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to auto-nominate.");
    } finally {
      setAutoLoading(false);
    }
  }

  async function handleManualAdd() {
    if (!selectedPlayerId) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const added = await insertNominees([selectedPlayerId]);
      setMessage(added > 0 ? "Player added as a nominee." : "This player is already nominated for this year.");
      setSelectedPlayerId("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add nominee.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          Year
        </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-32 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-muted/70 hover:border-border/80 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
        />
      </div>

      {/* Auto-nominate */}
      <div className="card p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">
              Auto-Nominate Top 10
            </h2>
            <p className="text-xs text-muted">Based on the Official points leaderboard, all-time.</p>
          </div>
        </div>

        {topByPoints.length === 0 ? (
          <p className="text-sm text-muted">No ranked players yet — nothing to auto-nominate.</p>
        ) : (
          <>
            <ol className="mb-4 flex flex-col gap-1.5 text-sm">
              {topByPoints.map((p, i) => (
                <li key={p.playerId} className="flex items-center justify-between text-white/90">
                  <span>
                    {i + 1}. {p.realName?.trim() || p.username}
                  </span>
                  <span className="text-gold">{p.points} pts</span>
                </li>
              ))}
            </ol>
            <button
              onClick={handleAutoNominate}
              disabled={autoLoading}
              className="flex items-center justify-center rounded-xl bg-gold px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {autoLoading ? "Adding..." : `Nominate These 10 for ${year}`}
            </button>
          </>
        )}
      </div>

      {/* Manual add */}
      <div className="card p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <UserPlus size={16} />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">
              Manually Add a Nominee
            </h2>
            <p className="text-xs text-muted">
              For older players without recorded match history.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SearchableSelect
              label="Player"
              value={selectedPlayerId}
              onChange={setSelectedPlayerId}
              options={playerOptions}
              placeholder="Select a player…"
              required
            />
          </div>
          <button
            onClick={handleManualAdd}
            disabled={!selectedPlayerId || loading}
            className="flex shrink-0 items-center justify-center rounded-xl bg-gold px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Nominee"}
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-indigo-light">{message}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}