"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

export default function MatchForm() {
  const supabase = createClient ();
  const router = useRouter();

  const [opponentName, setOpponentName] = useState("");
  const [opponentTag, setOpponentTag] = useState("");
  const [competition, setCompetition] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("matches").insert({
      opponent_name: opponentName,
      opponent_tag: opponentTag || null,
      competition: competition || null,
      match_date: matchDate,
      status: "upcoming",
      moderator_id: userData.user?.id ?? null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/dashboard/matches");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Opponent Name</label>
        <input
          required
          value={opponentName}
          onChange={(e) => setOpponentName(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Titan Esports"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          Opponent Tag (optional, short)
        </label>
        <input
          value={opponentTag}
          onChange={(e) => setOpponentTag(e.target.value)}
          maxLength={6}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="TITAN"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Competition</label>
        <input
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Champions League · Group Stage"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Date & Time</label>
        <input
          type="datetime-local"
          required
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
        {loading ? "Creating..." : "Create Fixture"}
      </button>
    </form>
  );
}