"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmActionButton from "@/app/components/ConfirmActionButton";
import { generateKnockoutFromGroups } from "@/app/lib/fixtures/generateFixtures";

type PlayerDetails = { id: string; efootball_username: string } | { id: string; efootball_username: string }[] | null;

type StandingRow = {
  player_id: string;
  player_details: PlayerDetails;
};

type Props = {
  tournamentId: string;
  matches: { round: number; status: string; stage: string | null }[];
  groupStandings: { groupName: string; standings: StandingRow[] }[];
  qualifiersPerGroup: number;
};

function getUsername(pd: PlayerDetails): string {
  const p = Array.isArray(pd) ? pd[0] : pd;
  return p?.efootball_username ?? "Unknown";
}

export default function GroupKnockoutTransition({
  tournamentId,
  matches,
  groupStandings,
  qualifiersPerGroup,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const groupMatches = matches.filter((m) => m.stage === "group");
  const knockoutMatches = matches.filter((m) => m.stage === "knockout");

  const allGroupsDone =
    groupMatches.length > 0 &&
    groupMatches.every((m) => m.status === "completed" || m.status === "bye");

  const alreadyGenerated = knockoutMatches.length > 0;

  // If the group stage is not complete, this section is not needed.
  if (!allGroupsDone) return null;

  async function runGeneration() {
    // If a previous knockout bracket exists, delete only that — group stage matches/results remain intact.
    if (alreadyGenerated) {
      await supabase
        .from("tournament_matches")
        .delete()
        .eq("tournament_id", tournamentId)
        .eq("stage", "knockout");
    }

    const groupsForDraw = groupStandings.map((g) => ({
      groupName: g.groupName,
      ranked: g.standings.slice(0, qualifiersPerGroup).map((row) => ({
        id: row.player_id,
        username: getUsername(row.player_details),
      })),
    }));

    const drafts = generateKnockoutFromGroups(groupsForDraw, qualifiersPerGroup);
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
    runGeneration().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to generate knockout bracket.")
    );
  }

  return (
    <div className="mt-6 flex flex-col items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        <Trophy size={16} className="text-gold" />
        Group Stage Complete
      </p>
      <p className="text-xs text-muted">
        Every group has finished — {qualifiersPerGroup} qualifier(s) per group will advance to a seeded knockout bracket.
      </p>

      {alreadyGenerated ? (
        <ConfirmActionButton
          onConfirm={runGeneration}
          confirmTitle="Re-generate Knockout Bracket?"
          confirmMessage="This will delete the existing knockout bracket and rebuild it from the group standings. Group stage matches/results will not be affected. This cannot be undone."
          confirmText="Yes, regenerate the bracket"
          cancelText="Keep current bracket"
          successMessage="Knockout bracket has been regenerated."
          errorMessage="Failed to generate bracket."
          isDangerous
          buttonClassName="btn-primary text-sm disabled:opacity-50"
        >
          Re-generate Knockout Bracket
        </ConfirmActionButton>
      ) : (
        <button onClick={handleClick} className="btn-primary text-sm disabled:opacity-50">
          Generate Knockout Bracket from Groups
        </button>
      )}

      {error && <p className="text-xs text-gold">{error}</p>}
    </div>
  );
}