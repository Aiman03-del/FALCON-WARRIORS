"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmActionButton from "@/app/components/ConfirmActionButton";
import { generateKnockoutRound1, generateRoundRobin } from "@/app/lib/fixtures/generateFixtures";

type Props = {
  tournamentId: string;
  format: string;
  doubleRound: boolean;
  participants: { id: string; username: string }[];
  alreadyGenerated: boolean;
};

export default function FixtureGenerator({
  tournamentId,
  format,
  doubleRound,
  participants,
  alreadyGenerated,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const notEnoughPlayers = participants.length < 2;

  const label =
    format === "league" && doubleRound
      ? "Generate Fixtures (Double Round)"
      : "Generate Fixtures Randomly";

  async function runGeneration() {
    if (alreadyGenerated) {
      await supabase.from("tournament_matches").delete().eq("tournament_id", tournamentId);
    }

    const drafts =
      format === "knockout"
        ? generateKnockoutRound1(participants.map((p) => ({ id: p.id, username: p.username })))
        : generateRoundRobin(
            participants.map((p) => ({ id: p.id, username: p.username })),
            doubleRound
          );

    const rows = drafts.map((d) => ({
      tournament_id: tournamentId,
      round: d.round,
      match_order: d.match_order,
      player1_id: d.player1_id,
      player2_id: d.player2_id,
      status: d.status,
    }));

    const { error: insertError } = await supabase.from("tournament_matches").insert(rows);
    if (insertError) throw new Error(insertError.message);

    router.refresh();
  }

  function handleClick() {
    setError(null);
    if (notEnoughPlayers) {
      setError("At least 2 approved participants are required.");
      return;
    }
    // এখনো কোনো ফিক্সচার নেই — হারানোর কিছু নেই, তাই সরাসরি জেনারেট
    runGeneration().catch((e) => setError(e instanceof Error ? e.message : "Failed to generate fixtures."));
  }

  return (
    <div>
      {alreadyGenerated ? (
        <ConfirmActionButton
          onConfirm={runGeneration}
          confirmTitle="Re-generate Fixtures?"
          confirmMessage="এটা এই টুর্নামেন্টের সব বিদ্যমান ম্যাচ স্থায়ীভাবে মুছে ফেলবে — ইতিমধ্যে এন্টার করা রেজাল্টসহ — এবং নতুন করে র‍্যান্ডম ড্র বানাবে। এটা আর ফিরিয়ে আনা যাবে না।"
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