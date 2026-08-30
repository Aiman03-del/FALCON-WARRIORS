"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmActionButton from "@/app/components/ConfirmActionButton";
import FillButton from "@/app/components/FillButton";
import { recalcStandings } from "@/app/lib/fixtures/recalcStandings";
import { generateWinnersRound1 } from "@/app/lib/fixtures/doubleElimination";
import { generateSwissRound1 } from "@/app/lib/fixtures/swissSystem";
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
  twoLegKnockout?: boolean; // নতুন
  participants: { id: string; username: string; seed?: number | null }[];
  alreadyGenerated: boolean;
  groupCount?: number | null;
  qualifiersPerGroup?: number | null;
  byeMethod?: "seed" | "random";
  variant?: "full" | "icon";
};

const DEFAULT_GROUP_COUNT = 4;

export default function FixtureGenerator({
  tournamentId,
  format,
  doubleRound,
  twoLegKnockout = false,
  participants,
  alreadyGenerated,
  groupCount,
  qualifiersPerGroup,
  byeMethod = "seed",
  variant = "full",
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
      : format === "double_elimination"
      ? "Generate Winners Bracket (Round 1)"
      : format === "swiss"
      ? "Generate Round 1 (Random Pairing)"
      : "Generate Fixtures Randomly";

  async function runGeneration() {
    if (alreadyGenerated) {
      await supabase.from("tournament_matches").delete().eq("tournament_id", tournamentId);
      await supabase
        .from("tournament_participants")
        .update({ group_name: null })
        .eq("tournament_id", tournamentId);
      await recalcStandings(supabase, tournamentId);
    }

    const drawPlayers = participants.map((p) => ({ id: p.id, username: p.username, seed: p.seed ?? null }));

    if (format === "knockout") {
      const drafts =
        byeMethod === "random"
          ? generateKnockoutRound1(drawPlayers, new Set(), twoLegKnockout)
          : generateSeededKnockoutRound1(drawPlayers, twoLegKnockout);
      const rows = drafts.map((d) => ({
        tournament_id: tournamentId,
        round: d.round,
        match_order: d.match_order,
        player1_id: d.player1_id,
        player2_id: d.player2_id,
        status: d.status,
        stage: "knockout",
        leg: d.leg ?? 1,
        tie_id: d.tie_id ?? null,
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
    } else if (format === "double_elimination") {
      const drafts = generateWinnersRound1(drawPlayers);
      const rows = drafts.map((d) => ({
        tournament_id: tournamentId,
        round: d.round,
        match_order: d.match_order,
        player1_id: d.player1_id,
        player2_id: d.player2_id,
        status: d.status,
        stage: "knockout",
        bracket_side: d.bracket_side,
      }));
      const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
      if (insertError) throw new Error(insertError.message);
    } else if (format === "swiss") {
      const drafts = generateSwissRound1(drawPlayers);
      const rows = drafts.map((d) => ({
        tournament_id: tournamentId,
        round: d.round,
        match_order: d.match_order,
        player1_id: d.player1_id,
        player2_id: d.player2_id,
        status: d.status,
        stage: "swiss",
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

  if (variant === "icon" && !alreadyGenerated) {
    return (
      <div className="inline-flex flex-col items-center gap-2">
        <div className="group/gen relative inline-flex">
          <button
            onClick={handleClick}
            disabled={notEnoughPlayers}
            aria-label={label}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-2 text-gold transition hover:border-gold/60 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Shuffle size={17} />
          </button>
          <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-bg px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/gen:opacity-100">
            {label}
          </span>
        </div>
        {notEnoughPlayers && <p className="text-center text-xs text-gold">{requirementHint}</p>}
        {error && <p className="text-center text-xs text-gold">{error}</p>}
      </div>
    );
  }

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
          renderTrigger={(onClick) => (
            <FillButton onClick={onClick} className="cursor-pointer text-sm">
              <Shuffle size={16} />
              Re-generate Fixtures
            </FillButton>
          )}
        >
          Re-generate Fixtures
        </ConfirmActionButton>
      ) : (
        <button
          onClick={handleClick}
          disabled={notEnoughPlayers}
          className="btn-primary flex cursor-pointer items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
