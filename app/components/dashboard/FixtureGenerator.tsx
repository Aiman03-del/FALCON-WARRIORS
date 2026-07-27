"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmActionButton from "@/app/components/ConfirmActionButton";
import {
  generateGroups,
  generateGroupStageFixtures,
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
};

export default function FixtureGenerator({
  tournamentId,
  format,
  doubleRound,
  participants,
  alreadyGenerated,
  groupCount,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const minRequired = format === "group_knockout" ? (groupCount ?? 2) * 2 : 2;
  const notEnoughPlayers = participants.length < minRequired;

  const label =
    format === "league" && doubleRound
      ? "Generate Fixtures (Double Round)"
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
      const drafts = generateSeededKnockoutRound1(drawPlayers);
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
      const groups = generateGroups(drawPlayers, groupCount ?? 4);

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
    if (notEnoughPlayers) {
      setError(
        format === "group_knockout"
          ? `At least ${minRequired} approved participants are required for ${groupCount ?? 4} groups.`
          : "At least 2 approved participants are required."
      );
      return;
    }
    runGeneration().catch((e) => setError(e instanceof Error ? e.message : "Failed to generate fixtures."));
  }

  return (
    <div>
      {alreadyGenerated ? (
        <ConfirmActionButton
          onConfirm={runGeneration}
          confirmTitle="Re-generate Fixtures?"
          confirmMessage="এটা এই টুর্নামেন্টের সব বিদ্যমান ম্যাচ স্থায়ীভাবে মুছে ফেলবে — ইতিমধ্যে এন্টার করা রেজাল্টসহ — এবং নতুন করে ড্র বানাবে (গ্রুপ বণ্টনও রিসেট হবে)। এটা আর ফিরিয়ে আনা যাবে না।"
          confirmText="হ্যাঁ, মুছে নতুন করে জেনারেট করুন"
          cancelText="বর্তমান ফিক্সচার রাখুন"
          successMessage="ফিক্সচার আবার জেনারেট হয়েছে।"
          errorMessage="ফিক্সচার জেনারেট করতে সমস্যা হয়েছে।"
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
      {error && <p className="mt-2 text-xs text-gold">{error}</p>}
    </div>
  );
}