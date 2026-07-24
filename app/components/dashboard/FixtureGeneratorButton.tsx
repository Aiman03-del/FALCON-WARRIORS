"use client";

import { useState } from "react";
import { Zap, Loader2, AlertCircle } from "lucide-react";

type Props = {
  tournamentId: string;
  participantCount: number;
  tournamentFormat: "league" | "knockout";
};

export default function FixtureGeneratorButton({ 
  tournamentId, 
  participantCount,
  tournamentFormat = "league"
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleGenerateFixtures() {
    if (participantCount < 2) {
      setError("At least 2 participants required to generate fixtures");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // API call to generate fixtures
      // const response = await fetch(`/api/tournaments/${tournamentId}/generate-fixtures`, {
      //   method: "POST",
      //   body: JSON.stringify({ format: tournamentFormat }),
      // });

      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to generate fixtures");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleGenerateFixtures}
        disabled={loading || participantCount < 2}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo px-4 py-2.5 font-semibold text-white transition-all hover:bg-indigo-light disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap size={16} />
            Generate Fixtures
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 flex items-center gap-2 rounded bg-gold/10 p-2 text-sm text-gold">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-2 rounded bg-indigo/10 p-2 text-sm text-indigo-light">
          ✓ Fixtures generated successfully! {participantCount} participants · {tournamentFormat} format
        </div>
      )}

      <p className="mt-2 text-xs text-muted">
        Format: <span className="capitalize">{tournamentFormat}</span> · Participants: {participantCount}
      </p>
    </div>
  );
}
