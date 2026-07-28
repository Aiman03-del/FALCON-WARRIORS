"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmActionButton from "@/app/components/ConfirmActionButton";
import {
  generateGroups,
  generateGroupStageFixtures,
  generateKnockoutRound1,
  generateRoundRobin,
  generateSeededKnockoutRound1,
} from "@/app/lib/fixtures/generateFixtures";

type Props = {
  tournamentId: string;
  format: string;
  doubleRound: boolean;
  participants: { id: string; username: string; seed?: number | null }[];
  alreadyGenerated: boolean;
  groupCount?: number | null;
  qualifiersPerGroup?: number | null;
  byeMethod?: "seed" | "random";
};

const DEFAULT_GROUP_COUNT = 4;

export default function FixtureGenerator({
  tournamentId,
  format,
  doubleRound,
  participants,
  alreadyGenerated,
  groupCount,
  qualifiersPerGroup,
  byeMethod = "seed",
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const effectiveGroupCount = groupCount ?? DEFAULT_GROUP_COUNT;

  // Each group needs at least 2 players to form a match, and ideally enough
  // players to actually produce `qualifiersPerGroup` qualifiers later.
  const minPerGroup = Math.max(2, qualifiersPerGroup ?? 2);
  const minRequired = format === "group_knockout" ? effectiveGroupCount * minPerGroup : 2;
  const notEnoughPlayers = participants.length < minRequired;

  const label =
    format === "league" && doubleRound
      ? "Generate Fixtures (Double Round)"
      : format === "league_playoff"
      ? doubleRound
        ? "Generate League Fixtures (Double Round)"
        : "Generate League Fixtures"
      : format === "knockout"
      ? "Generate Seeded Bracket"
      : format === "group_knockout"
      ? "Draw Groups & Generate Fixtures"
      : "Generate Fixtures Randomly";

  async function runGeneration() {
    if (alreadyGenerated) {
      await supabase.from("tournament_matches").delete().eq("tournament_id", tournamentId);
      // Also reset any previous group draw so re-generating starts clean.
      await supabase
        .from("tournament_participants")
        .update({ group_name: null })
        .eq("tournament_id", tournamentId);
    }

    const drawPlayers = participants.map((p) => ({ id: p.id, username: p.username, seed: p.seed ?? null }));

    if (format === "knockout") {
      const drafts =
        byeMethod === "random" ? generateKnockoutRound1(drawPlayers) : generateSeededKnockoutRound1(drawPlayers);
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
    } else if (format === "group_knockout") {
      const groups = generateGroups(drawPlayers, effectiveGroupCount);

      // Persist each participant's group assignment.
      await Promise.all(
        groups.map((g) =>
          supabase
            .from("tournament_participants")
            .update({ group_name: g.group_name })
            .eq("tournament_id", tournamentId)
            .eq("player_id", g.participant.id)
        )
      );

      const drafts = generateGroupStageFixtures(groups, doubleRound);
      const rows = drafts.map((d) => ({
        tournament_id: tournamentId,
        round: d.round,
        match_order: d.match_order,
        player1_id: d.player1_id,
        player2_id: d.player2_id,
        status: d.status,
        stage: "group",
        group_name: d.group_name,
      }));
      const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
      if (insertError) throw new Error(insertError.message);
    } else {
      // Covers both "league" and "league_playoff" — the first phase of a
      // playoff tournament is just a plain round-robin; the seeded knockout
      // bracket for the top N is generated separately once the league stage
      // is complete (see the Group → Knockout style transition button).
      const drafts = generateRoundRobin(drawPlayers, doubleRound);
      const rows = drafts.map((d) => ({
        tournament_id: tournamentId,
        round: d.round,
        match_order: d.match_order,
        player1_id: d.player1_id,
        player2_id: d.player2_id,
        status: d.status,
        stage: "league",
      }));
      const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
      if (insertError) throw new Error(insertError.message);
    }

    router.refresh();
  }

  function handleClick() {
    setError(null);
    if (notEnoughPlayers) return; // button is disabled anyway; the hint below explains why
    runGeneration().catch((e) => setError(e instanceof Error ? e.message : "Failed to generate fixtures."));
  }

  const requirementHint =
    format === "group_knockout"
      ? `At least ${minRequired} approved participants are required to generate fixtures (${effectiveGroupCount} groups × minimum ${minPerGroup} per group) — currently ${participants.length} are available.`
      : `At least 2 approved participants are required to generate fixtures — currently ${participants.length} are available.`;

  return (
    <div>
      {alreadyGenerated ? (
        <ConfirmActionButton
          onConfirm={runGeneration}
          confirmTitle="Re-generate Fixtures?"
          confirmMessage="This will permanently delete all existing fixtures for this tournament — including entered results — and regenerate the draw (group assignments will also reset). This cannot be undone."
          confirmText="Yes, delete and regenerate"
          cancelText="Keep current fixtures"
          successMessage="Fixtures have been regenerated."
          errorMessage="Failed to regenerate fixtures."
          isDangerous
          buttonClassName="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Shuffle size={16} />
          Re-generate Fixtures
        </ConfirmActionButton>
      ) : (
        <button
          onClick={handleClick}
          disabled={notEnoughPlayers}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Shuffle size={16} />
          {label}
        </button>
      )}
      {notEnoughPlayers && !alreadyGenerated && (
        <p className="mt-2 text-xs text-gold">{requirementHint}</p>
      )}
      {error && <p className="mt-2 text-xs text-gold">{error}</p>}
    </div>
  );
}
