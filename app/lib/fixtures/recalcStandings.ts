import { SupabaseClient } from "@supabase/supabase-js";
import { computeStandingsFromMatches } from "./computeStandings";

export async function recalcStandings(supabase: SupabaseClient, tournamentId: string) {
  const { data: tournamentRow } = await supabase
    .from("tournaments")
    .select("format")
    .eq("id", tournamentId)
    .single();

  // খাঁটি Knockout ফরম্যাটে সব ম্যাচই "knockout" stage-এর — তাই সেগুলোও পয়েন্ট
  // টেবিলে গোনা দরকার। গ্রুপ/লিগ+প্লেঅফের মতো ফরম্যাটে আগের মতোই নকআউট বাদ থাকবে।
  const includeKnockout = tournamentRow?.format === "knockout";

  const { data: participants, error: participantsError } = await supabase
    .from("tournament_participants")
    .select("id, player_id")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (participantsError) throw new Error(participantsError.message);
  if (!participants || participants.length === 0) return;

  const { data: matches, error: matchesError } = await supabase
    .from("tournament_matches")
    .select("player1_id, player2_id, player1_score, player2_score, status, stage")
    .eq("tournament_id", tournamentId)
    .eq("status", "completed");

  if (matchesError) throw new Error(matchesError.message);

  const statsMap = computeStandingsFromMatches(
    participants.map((p) => p.player_id),
    matches ?? [],
    { includeKnockout }
  );

  const updates = await Promise.all(
    participants.map((p) =>
      supabase.from("tournament_participants").update(statsMap[p.player_id]).eq("id", p.id)
    )
  );

  const updateError = updates.find((r) => r.error)?.error;
  if (updateError) throw new Error(updateError.message);
}