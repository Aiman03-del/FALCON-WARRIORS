"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FillButton from "@/app/components/FillButton";
import { createClient } from "@/app/lib/supabase/client";
import SelectField from "../SelectField";
import { recalcAllPlayerStats } from "@/app/lib/matches/recalcPlayerStats";

type PlayerOption = { id: string; efootball_username: string };

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
  const [scorerId, setScorerId] = useState("");
  const [motmId, setMotmId] = useState("");
  const [playedById, setPlayedById] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (matchType !== "external") return;

    supabase
      .from("match_squad")
      .select("player_id")
      .eq("match_id", matchId)
      .maybeSingle()
      .then(({ data }) => setPlayedById(data?.player_id ?? ""));
  }, [matchId, matchType, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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

      if (playedById) {
        await supabase.from("match_squad").insert({ match_id: matchId, player_id: playedById });

        if (status === "completed" && scoreHome > 0) {
          await supabase.from("match_goal_entries").insert({
            match_id: matchId,
            player_id: playedById,
            goals: scoreHome,
          });
        }
      }
    }

    await recalcAllPlayerStats(supabase);

    setLoading(false);
    router.push("/dashboard/matches");
    router.refresh();
  }

  const roster = tournamentSquad ?? players;

  return (
    <form onSubmit={handleSave} className="card mt-6 flex flex-col gap-4 p-6">
      <div>
        <SelectField
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "live", label: "Live" },
            { value: "completed", label: "Completed" },
          ]}
          className="w-full"
        />
      </div>

      {status !== "upcoming" && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted">Falcon Warriors Score</label>
            <input
              type="number"
              min={0}
              value={scoreHome}
              onChange={(e) => setScoreHome(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted">Opponent Score</label>
            <input
              type="number"
              min={0}
              value={scoreAway}
              onChange={(e) => setScoreAway(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>
        </div>
      )}

      {matchType === "external" && (
        <SelectField
          label="Played By (Falcon Warriors player)"
          value={playedById}
          onChange={setPlayedById}
          searchable={roster.length > 6}
          placeholder="— Select player —"
          options={roster.map((player) => ({
            value: player.id,
            label: player.efootball_username,
          }))}
        />
      )}

      {matchType !== "external" && status === "completed" && (
        <>
          <div>
            <SelectField
              label="Add Goal Scorer (optional)"
              value={scorerId}
              onChange={setScorerId}
              options={[
                { value: "", label: "— None —" },
                ...players.map((player) => ({ value: player.id, label: player.efootball_username })),
              ]}
              placeholder="— None —"
              clearable
              className="w-full"
            />
          </div>

          <div>
            <SelectField
              label="Man of the Match (optional)"
              value={motmId}
              onChange={setMotmId}
              options={[
                { value: "", label: "— None —" },
                ...players.map((player) => ({ value: player.id, label: player.efootball_username })),
              ]}
              placeholder="— None —"
              clearable
              className="w-full"
            />
          </div>
        </>
      )}

      {status === "completed" && (
        <div>
          <SelectField
            label="Man of the Match (optional)"
            value={motmId}
            onChange={setMotmId}
            options={[
              { value: "", label: "— None —" },
              ...players.map((player) => ({ value: player.id, label: player.efootball_username })),
            ]}
            placeholder="— None —"
            clearable
            className="w-full"
          />
        </div>
      )}

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      <FillButton type="submit" disabled={loading} className="mt-2 disabled:opacity-50">
        {loading ? "Saving..." : "Save Result"}
      </FillButton>
    </form>
  );
}