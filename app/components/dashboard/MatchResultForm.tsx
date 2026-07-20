"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SelectField from "@/app/components/SelectField";
import FillButton from "@/app/components/FillButton";
import { createClient } from "@/app/lib/supabase/client";

type PlayerOption = { id: string; efootball_username: string };

type Props = {
  matchId: string;
  currentStatus: string;
  currentScoreHome: number | null;
  currentScoreAway: number | null;
  players: PlayerOption[];
};

export default function MatchResultForm({
  matchId,
  currentStatus,
  currentScoreHome,
  currentScoreAway,
  players,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [scoreHome, setScoreHome] = useState(currentScoreHome ?? 0);
  const [scoreAway, setScoreAway] = useState(currentScoreAway ?? 0);
  const [scorerId, setScorerId] = useState("");
  const [motmId, setMotmId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    // Optional: goal scorer entry
    if (status === "completed" && scorerId) {
      await supabase.from("match_events").insert({
        match_id: matchId,
        scorer_id: scorerId,
        event_type: "goal",
      });

      // Update player_stats (goals +1, not incrementing matches here —
      // matches/wins/losses will be handled in the bulk stat update below)
      const { data: statRow } = await supabase
        .from("player_stats")
        .select("id, goals")
        .eq("player_id", scorerId)
        .single();

      if (statRow) {
        await supabase
          .from("player_stats")
          .update({ goals: statRow.goals + 1 })
          .eq("id", statRow.id);
      } else {
        await supabase.from("player_stats").insert({ player_id: scorerId, goals: 1 });
      }
    }

    // Optional: Man of the Match entry
    if (status === "completed" && motmId) {
      await supabase.from("match_events").insert({
        match_id: matchId,
        scorer_id: motmId,
        event_type: "motm",
      });

      const { data: statRow } = await supabase
        .from("player_stats")
        .select("id, motm_count")
        .eq("player_id", motmId)
        .single();

      if (statRow) {
        await supabase
          .from("player_stats")
          .update({ motm_count: statRow.motm_count + 1 })
          .eq("id", statRow.id);
      } else {
        await supabase.from("player_stats").insert({ player_id: motmId, motm_count: 1 });
      }
    }

    setLoading(false);
    router.push("/dashboard/matches");
    router.refresh();
  }

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
            <label className="mb-1 block text-xs font-medium text-muted">
              Falcon Warriors Score
            </label>
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

      {status === "completed" && (
        <>
          <div>
            <SelectField
              label="Add Goal Scorer (optional)"
              value={scorerId}
              onChange={setScorerId}
              options={[
                { value: "", label: "— None —" },
                ...players.map((p) => ({ value: p.id, label: p.efootball_username })),
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
                ...players.map((p) => ({ value: p.id, label: p.efootball_username })),
              ]}
              placeholder="— None —"
              clearable
              className="w-full"
            />
          </div>
        </>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <FillButton type="submit" disabled={loading} className="mt-2 disabled:opacity-50">
        {loading ? "Saving..." : "Save Result"}
      </FillButton>
    </form>
  );
}