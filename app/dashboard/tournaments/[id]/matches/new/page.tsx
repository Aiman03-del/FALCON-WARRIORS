"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import RoundStageSelect from "@/app/components/dashboard/RoundStageSelect";
import DatePicker from "@/app/components/DatePicker";
import BackLink from "@/app/components/BackLink";
import { createClient } from "@/app/lib/supabase/client";

export default function NewOfficialMatchPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tournamentId = params.id;

  const [opponentName, setOpponentName] = useState("");
  const [roundStage, setRoundStage] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("matches").insert({
      match_type: "external",
      tournament_id: tournamentId,
      opponent_name: opponentName,
      round_stage: roundStage || null,
      match_date: matchDate,
      status: "upcoming",
      moderator_id: userData.user?.id ?? null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/dashboard/tournaments/${tournamentId}/matches`);
    router.refresh();
  }

  return (
    <div>
      <BackLink href={`/dashboard/tournaments/${tournamentId}/matches`} label="Back to Matches" />
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Add Match</h1>

      <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Opponent Club Name</label>
          <input
            required
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="Mastannagar Club"
          />
        </div>

        <RoundStageSelect value={roundStage} onChange={setRoundStage} />

        <DatePicker label="Date & Time" value={matchDate} onChange={setMatchDate} type="datetime-local" />

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
          {loading ? "Adding..." : "Add Match"}
        </button>
      </form>
    </div>
  );
}