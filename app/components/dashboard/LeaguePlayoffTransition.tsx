"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmActionButton from "@/app/components/ConfirmActionButton";
import { generateSeededKnockoutRound1 } from "@/app/lib/fixtures/generateFixtures";

type PlayerDetails = { id: string; efootball_username: string } | { id: string; efootball_username: string }[] | null;

type StandingRow = {
  player_id: string;
  player_details: PlayerDetails;
};

type Props = {
  tournamentId: string;
  matches: { status: string; stage: string | null }[];
  standings: StandingRow[]; // data from getTournamentStandings(), already ranked
  playoffSize: number;
};

function getUsername(pd: PlayerDetails): string {
  const p = Array.isArray(pd) ? pd[0] : pd;
  return p?.efootball_username ?? "Unknown";
}

export default function LeaguePlayoffTransition({ tournamentId, matches, standings, playoffSize }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const leagueMatches = matches.filter((m) => m.stage === "league");
  const knockoutMatches = matches.filter((m) => m.stage === "knockout");

  const allLeagueDone =
    leagueMatches.length > 0 &&
    leagueMatches.every((m) => m.status === "completed" || m.status === "bye");

  const alreadyGenerated = knockoutMatches.length > 0;
  const notEnoughForPlayoff = standings.length < playoffSize;

  // If the league stage is not complete, this section is not displayed.
  if (!allLeagueDone) return null;

  async function runGeneration() {
    // If an existing playoff draw exists, delete only that — league matches/results remain intact.
    // (getTournamentStandings already filters out stage !== "knockout".)
    if (alreadyGenerated) {
      await supabase
        .from("tournament_matches")
        .delete()
        .eq("tournament_id", tournamentId)
        .eq("stage", "knockout");
    }

    const topN = standings.slice(0, playoffSize).map((row, i) => ({
      id: row.player_id,
      username: getUsername(row.player_details),
      seed: i + 1, // the league table position becomes the seed
    }));

    const drafts = generateSeededKnockoutRound1(topN);
    const rows = drafts.map((d) => ({
      tournament_id: tournamentId,
      round: d.round,
      match_order: d.match_order,
      player1_id: d.player1_id,
      player2_id: d.player2_id,
      status: d.status,
      stage: "knockout",
    }));

    const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
    if (insertError) throw new Error(insertError.message);

    router.refresh();
  }

  function handleClick() {
    setError(null);
    if (notEnoughForPlayoff) {
      setError(`At least ${playoffSize} ranked players are required for the playoff.`);
      return;
    }
    runGeneration().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to generate playoff bracket.")
    );
  }

  return (
    <div className="mt-6 flex flex-col items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        <Trophy size={16} className="text-gold" />
        League Stage Complete
      </p>
      <p className="text-xs text-muted">
        Top {playoffSize} from the league table will advance to a seeded knockout playoff.
      </p>

      {alreadyGenerated ? (
        <ConfirmActionButton
          onConfirm={runGeneration}
          confirmTitle="Re-generate Playoff Bracket?"
          confirmMessage="This will delete the existing playoff bracket and rebuild it from the league standings. League stage matches/results will not be affected. This cannot be undone."
          confirmText="Yes, regenerate the bracket"
          cancelText="Keep current bracket"
          successMessage="Playoff bracket has been regenerated."
          errorMessage="Failed to generate playoff bracket."
          isDangerous
          buttonClassName="btn-primary text-sm disabled:opacity-50"
        >
          Re-generate Playoff Bracket
        </ConfirmActionButton>
      ) : (
        <button
          onClick={handleClick}
          disabled={notEnoughForPlayoff}
          className="btn-primary text-sm disabled:opacity-50"
        >
          Generate Playoff Bracket (Top {playoffSize})
        </button>
      )}

      {error && <p className="text-xs text-gold">{error}</p>}
    </div>
  );
}