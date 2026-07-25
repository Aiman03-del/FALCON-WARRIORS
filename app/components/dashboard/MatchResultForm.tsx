"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { recalcAllPlayerStats } from "@/app/lib/matches/recalcPlayerStats";
import SelectField from "../SelectField";

type PlayerOption = { id: string; efootball_username: string; avatar_url?: string | null };

type Props = {
  matchId: string;
  matchType: "external" | "internal";
  currentStatus: string;
  currentScoreHome: number | null;
  currentScoreAway: number | null;
  player1Id?: string;
  player2Id?: string;
  player1Name?: string;
  player2Name?: string;
  players: PlayerOption[];
  tournamentSquad: PlayerOption[] | null;
};

type PlayedEntry = {
  playerId: string;
  goals: number;
  rating: string;
};

function PlayerTile({
  player,
  selected,
  onClick,
}: {
  player: PlayerOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
        selected
          ? "border-gold bg-gold/10 text-white"
          : "border-border bg-surface-2 text-white/70 hover:border-white/30"
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-gold">
        {player.efootball_username.slice(0, 2).toUpperCase()}
      </div>
      <span className="truncate flex-1">{player.efootball_username}</span>
      {selected && <Check size={15} className="text-gold shrink-0" />}
    </button>
  );
}

export default function MatchResultForm({
  matchId,
  matchType,
  currentStatus,
  currentScoreHome,
  currentScoreAway,
  player1Id,
  player2Id,
  player1Name,
  player2Name,
  players,
  tournamentSquad,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [scoreHome, setScoreHome] = useState(currentScoreHome ?? 0);
  const [scoreAway, setScoreAway] = useState(currentScoreAway ?? 0);
  const [player1Rating, setPlayer1Rating] = useState("");
  const [player2Rating, setPlayer2Rating] = useState("");

  // একাধিক প্লেয়ার এখন ম্যাচ খেলতে পারবে, প্রত্যেকের গোল/রেটিং আলাদা
  const [playedEntries, setPlayedEntries] = useState<PlayedEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rosterPool = tournamentSquad ?? players;

  useEffect(() => {
    if (matchType !== "external") return;

    async function loadExisting() {
      const { data: squadRows } = await supabase
        .from("match_squad")
        .select("player_id")
        .eq("match_id", matchId);

      const { data: goalRows } = await supabase
        .from("match_goal_entries")
        .select("player_id, goals")
        .eq("match_id", matchId);

      const { data: ratingRows } = await supabase
        .from("match_ratings")
        .select("player_id, rating")
        .eq("match_id", matchId);

      const goalMap: Record<string, number> = {};
      for (const g of goalRows ?? []) goalMap[g.player_id] = g.goals;

      const ratingMap: Record<string, string> = {};
      for (const r of ratingRows ?? []) ratingMap[r.player_id] = String(r.rating);

      const entries: PlayedEntry[] = (squadRows ?? []).map((row) => ({
        playerId: row.player_id,
        goals: goalMap[row.player_id] ?? 0,
        rating: ratingMap[row.player_id] ?? "",
      }));

      setPlayedEntries(entries);
    }

    loadExisting();
  }, [matchId, matchType, supabase]);

  function togglePlayer(playerId: string) {
    setPlayedEntries((prev) => {
      const exists = prev.find((e) => e.playerId === playerId);
      if (exists) return prev.filter((e) => e.playerId !== playerId);
      return [...prev, { playerId, goals: 0, rating: "" }];
    });
  }

  function updateEntry(playerId: string, field: "goals" | "rating", value: string) {
    setPlayedEntries((prev) =>
      prev.map((e) =>
        e.playerId === playerId
          ? { ...e, [field]: field === "goals" ? Number(value) : value }
          : e
      )
    );
  }

  const totalEnteredGoals = playedEntries.reduce((sum, e) => sum + (e.goals || 0), 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (matchType === "external" && status === "completed" && playedEntries.length === 0) {
      setError("যারা এই ম্যাচ খেলেছে তাদের কমপক্ষে একজনকে সিলেক্ট করুন।");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase
      .from("matches")
      .update({
        status,
        score_home: status === "upcoming" ? null : scoreHome,
        score_away: status === "upcoming" ? null : scoreAway,
      })
      .eq("id", matchId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    if (matchType === "internal" && status === "completed") {
      await supabase.from("match_events").delete().eq("match_id", matchId).eq("event_type", "motm");

      let winnerId: string | null = null;
      if (scoreHome > scoreAway) winnerId = player1Id ?? null;
      else if (scoreAway > scoreHome) winnerId = player2Id ?? null;

      if (winnerId) {
        await supabase.from("match_events").insert({
          match_id: matchId,
          scorer_id: winnerId,
          event_type: "motm",
        });
      }
    }

    if (matchType === "external") {
      await supabase.from("match_squad").delete().eq("match_id", matchId);
      await supabase.from("match_goal_entries").delete().eq("match_id", matchId);
      await supabase.from("match_ratings").delete().eq("match_id", matchId);

      if (playedEntries.length > 0) {
        // যারা খেলেছে সবাইকে squad-এ যোগ (matches/win-loss স্ট্যাটসের জন্য)
        await supabase.from("match_squad").insert(
          playedEntries.map((entry) => ({ match_id: matchId, player_id: entry.playerId }))
        );

        if (status === "completed") {
          const goalRowsToInsert = playedEntries
            .filter((entry) => entry.goals > 0)
            .map((entry) => ({
              match_id: matchId,
              player_id: entry.playerId,
              goals: entry.goals,
            }));

          if (goalRowsToInsert.length > 0) {
            await supabase.from("match_goal_entries").insert(goalRowsToInsert);
          }

          const ratingRowsToInsert = playedEntries
            .filter((entry) => entry.rating)
            .map((entry) => ({
              match_id: matchId,
              player_id: entry.playerId,
              rating: Number(entry.rating),
            }));

          if (ratingRowsToInsert.length > 0) {
            await supabase.from("match_ratings").insert(ratingRowsToInsert);
          }
        }
      }
    }

    if (matchType === "internal" && status === "completed") {
      await supabase.from("match_ratings").delete().eq("match_id", matchId);

      const ratingsToInsert = [] as Array<{ match_id: string; player_id: string; rating: number }>;
      if (player1Rating && player1Id) {
        ratingsToInsert.push({ match_id: matchId, player_id: player1Id, rating: Number(player1Rating) });
      }
      if (player2Rating && player2Id) {
        ratingsToInsert.push({ match_id: matchId, player_id: player2Id, rating: Number(player2Rating) });
      }
      if (ratingsToInsert.length > 0) {
        await supabase.from("match_ratings").insert(ratingsToInsert);
      }
    }

    await recalcAllPlayerStats(supabase);

    setLoading(false);
    router.push("/dashboard/matches");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="card mt-6 flex flex-col gap-6 p-6">
      {/* Status */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Status</label>
        <SelectField
          value={status}
          onChange={setStatus}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "live", label: "Live" },
            { value: "completed", label: "Completed" },
          ]}
        />
      </div>

      {matchType === "external" && status !== "upcoming" && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">
            কারা এই ম্যাচ খেলেছে? (একাধিক সিলেক্ট করা যাবে)
          </p>
          {rosterPool.length === 0 ? (
            <p className="text-sm text-muted">
              No players available. Select a squad first in tournament details.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {rosterPool.map((p) => (
                <PlayerTile
                  key={p.id}
                  player={p}
                  selected={playedEntries.some((e) => e.playerId === p.id)}
                  onClick={() => togglePlayer(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {matchType === "internal" && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Match Room</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gold/50 bg-gold/10 px-4 py-3 text-center text-sm font-semibold text-white">
              {player1Name ?? "Player 1"}
            </div>
            <div className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-center text-sm font-semibold text-white">
              {player2Name ?? "Player 2"}
            </div>
          </div>
        </div>
      )}

      {/* Score */}
      {status !== "upcoming" && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Final Score</p>
          <div className="flex items-center justify-center gap-4 rounded-lg border border-border bg-surface-2 px-3 sm:px-4 md:px-6 py-5">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted">
                {matchType === "internal" ? player1Name ?? "Home" : "Falcon Warriors"}
              </span>
              <input
                type="number"
                min={0}
                value={scoreHome}
                onChange={(e) => setScoreHome(Number(e.target.value))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-16 rounded-lg border border-border bg-surface px-2 py-2 text-center font-display text-2xl font-bold outline-none focus:border-gold"
              />
            </div>
            <span className="font-display text-2xl text-muted">-</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted">
                {matchType === "internal" ? player2Name ?? "Away" : "Opponent"}
              </span>
              <input
                type="number"
                min={0}
                value={scoreAway}
                onChange={(e) => setScoreAway(Number(e.target.value))}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-16 rounded-lg border border-border bg-surface px-2 py-2 text-center font-display text-2xl font-bold outline-none focus:border-gold"
              />
            </div>
          </div>

          {status === "completed" && matchType === "internal" && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-muted">
                <span>{player1Name ?? "Player 1"} Rating</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step="0.1"
                  value={player1Rating}
                  onChange={(e) => setPlayer1Rating(e.target.value)}
                  placeholder="1-10"
                  className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                <span>{player2Name ?? "Player 2"} Rating</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step="0.1"
                  value={player2Rating}
                  onChange={(e) => setPlayer2Rating(e.target.value)}
                  placeholder="1-10"
                  className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
            </div>
          )}

          {status === "completed" && matchType === "external" && playedEntries.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted">প্রতিটি প্লেয়ারের গোল ও রেটিং দিন</p>
              {playedEntries.map((entry) => {
                const p = rosterPool.find((x) => x.id === entry.playerId);
                return (
                  <div
                    key={entry.playerId}
                    className="grid grid-cols-[1fr_80px_80px] items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
                  >
                    <span className="truncate text-sm">{p?.efootball_username ?? "Unknown"}</span>
                    <input
                      type="number"
                      min={0}
                      value={entry.goals}
                      onChange={(e) => updateEntry(entry.playerId, "goals", e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="Goals"
                      className="rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step="0.1"
                      value={entry.rating}
                      onChange={(e) => updateEntry(entry.playerId, "rating", e.target.value)}
                      placeholder="Rating"
                      className="rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm outline-none focus:border-gold"
                    />
                  </div>
                );
              })}
              {totalEnteredGoals !== scoreHome && (
                <p className="text-xs text-gold/80">
                  সতর্কতা: এখন পর্যন্ত এন্ট্রি করা গোল ({totalEnteredGoals}) টিমের স্কোরের ({scoreHome})
                  সাথে মিলছে না। বাকি গোল সম্ভবত own-goal বা অজানা স্কোরার থেকে এসেছে — তাহলে সমস্যা নেই,
                  নাহলে চেক করে নিন।
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {matchType === "internal" && status === "completed" && (
        <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold">
          বিজয়ী স্বয়ংক্রিয়ভাবে MOTM পাবে, এবং গোল/ম্যাচ/win-loss উভয় প্লেয়ারের স্ট্যাটসে যোগ হবে।
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-gold/15 px-3 py-2 text-sm text-gold">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
        {loading ? "Saving..." : "Submit Result"}
      </button>
    </form>
  );
}