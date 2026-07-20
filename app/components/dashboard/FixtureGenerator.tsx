"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { generateKnockoutRound1, generateRoundRobin } from "@/app/lib/fixtures/generateFixtures";
type Props = {
  tournamentId: string;
  format: string;
  participants: { id: string; username: string }[];
  alreadyGenerated: boolean;
};

export default function FixtureGenerator({
  tournamentId,
  format,
  participants,
  alreadyGenerated,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (participants.length < 2) {
      setError("At least 2 approved participants are required.");
      return;
    }

    if (
      alreadyGenerated &&
      !confirm("All fixtures will be deleted and regenerated. Continue?")
    ) {
      return;
    }

    setError(null);
    setLoading(true);

    if (alreadyGenerated) {
      await supabase.from("tournament_matches").delete().eq("tournament_id", tournamentId);
    }

    const drafts =
      format === "knockout"
        ? generateKnockoutRound1(participants.map((p) => ({ id: p.id, username: p.username })))
        : generateRoundRobin(participants.map((p) => ({ id: p.id, username: p.username })));

    const rows = drafts.map((d) => ({
      tournament_id: tournamentId,
      round: d.round,
      match_order: d.match_order,
      player1_id: d.player1_id,
      player2_id: d.player2_id,
      status: d.status,
    }));

    const { error: insertError } = await supabase.from("tournament_matches").insert(rows);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
      >
        <Shuffle size={16} />
        {loading
          ? "Generating..."
          : alreadyGenerated
          ? "Re-generate Fixtures"
          : "Generate Fixtures Randomly"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}