"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import RoundStageSelect from "@/app/components/dashboard/RoundStageSelect";
import DatePicker from "@/app/components/DatePicker";
import BackLink from "@/app/components/BackLink";
import ImageUploadInput from "@/app/components/ImageUploadInput";
import { createClient } from "@/app/lib/supabase/client";

export default function NewOfficialMatchPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const tournamentSlug = params.slug;
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  const [opponentName, setOpponentName] = useState("");
  const [opponentLogoUrl, setOpponentLogoUrl] = useState("");
  const [roundStage, setRoundStage] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tournamentSlug) return;

    supabase
      .from("tournaments")
      .select("id")
      .eq("slug", tournamentSlug)
      .single()
      .then(({ data }) => setTournamentId(data?.id ?? null));
  }, [supabase, tournamentSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!tournamentId) {
      setLoading(false);
      setError("Tournament is still loading. Please try again in a moment.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("matches").insert({
      match_type: "external",
      tournament_id: tournamentId,
      opponent_name: opponentName,
      opponent_logo_url: opponentLogoUrl || null,
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

    router.push(`/dashboard/tournaments/${tournamentSlug}/matches`);
    router.refresh();
  }

  return (
    <div>
      <BackLink href={`/dashboard/tournaments/${tournamentSlug}/matches`} label="Back to Matches" />
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

        <ImageUploadInput
          label="Opponent Club Logo (optional)"
          folder="/falcon-warriors/opponent-logos"
          value={opponentLogoUrl}
          onUploaded={setOpponentLogoUrl}
        />

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