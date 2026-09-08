import { recalcStandings } from "@/app/lib/fixtures/recalcStandings";
import { recalcAllPlayerStats } from "@/app/lib/matches/recalcPlayerStats";

export async function saveMatchResult(
  supabase: any,
  params: {
    matchId: string;
    tournamentId: string;
    player1Id: string | null;
    player2Id: string | null;
    score1: number;
    score2: number;
    format: string;
    isKnockoutStage?: boolean;
    penalty1?: number | null;
    penalty2?: number | null;
    round?: number;
    matchOrder?: number;
  }
) {
  const {
    matchId, tournamentId, player1Id, player2Id, score1, score2, format,
    isKnockoutStage = false,
    penalty1 = null,
    penalty2 = null,
    round,
    matchOrder,
  } = params;

  let winnerId: string | null;

  if (score1 === score2) {
    if (isKnockoutStage) {
      if (penalty1 == null || penalty2 == null || penalty1 === penalty2) {
        throw new Error("Knockout matches cannot end in a draw. A valid penalty shootout score is required.");
      }
      winnerId = penalty1 > penalty2 ? player1Id : player2Id;
    } else {
      winnerId = null; // draws are valid in league/group stages
    }
  } else {
    winnerId = score1 > score2 ? player1Id : player2Id;
  }

  const finalPenalty1 = isKnockoutStage && score1 === score2 ? penalty1 : null;
  const finalPenalty2 = isKnockoutStage && score1 === score2 ? penalty2 : null;

  // A "preview-" ID means this match has not yet been created in the database (it is only a preview to show
  // who will play in the bracket). As soon as a score is saved, the actual match row is created here. No separate
  // "Generate Round" button is needed.
  const isPreview = matchId.startsWith("preview-") || matchId.startsWith("projected-");

  if (isPreview) {
    if (round == null || matchOrder == null) {
      throw new Error("Missing round/match order — cannot create the next-round match.");
    }

    // a duplicate row is checked first to avoid race conditions in the same slot
    const { data: existingRow } = await supabase
      .from("tournament_matches")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("round", round)
      .eq("match_order", matchOrder)
      .eq("stage", "knockout")
      .eq("is_third_place", false)
      .maybeSingle();

    if (existingRow?.id) {
      const { error: updateError } = await supabase
        .from("tournament_matches")
        .update({
          player1_score: score1,
          player2_score: score2,
          player1_penalty: finalPenalty1,
          player2_penalty: finalPenalty2,
          winner_id: winnerId,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", existingRow.id);
      if (updateError) throw new Error(updateError.message);
    } else {
      const { error: insertError } = await supabase.from("tournament_matches").insert({
        tournament_id: tournamentId,
        round,
        match_order: matchOrder,
        player1_id: player1Id,
        player2_id: player2Id,
        player1_score: score1,
        player2_score: score2,
        player1_penalty: finalPenalty1,
        player2_penalty: finalPenalty2,
        winner_id: winnerId,
        status: "completed",
        stage: "knockout",
        is_third_place: false,
        leg: 1,
        completed_at: new Date().toISOString(),
      });
      if (insertError) throw new Error(insertError.message);
    }
  } else {
    const { error: matchError } = await supabase
      .from("tournament_matches")
      .update({
        player1_score: score1,
        player2_score: score2,
        player1_penalty: finalPenalty1,
        player2_penalty: finalPenalty2,
        winner_id: winnerId,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", matchId);

    if (matchError) throw new Error(matchError.message);
  }

  await recalcStandings(supabase, tournamentId);
  await recalcAllPlayerStats(supabase);

  if (format === "league") {
    const { count } = await supabase
      .from("tournament_matches")
      .select("id", { count: "exact", head: true })
      .eq("tournament_id", tournamentId)
      .not("status", "in", "(completed,bye)");

    if (count === 0) {
      await supabase
        .from("tournaments")
        .update({ status: "completed" })
        .eq("id", tournamentId)
        .neq("status", "completed");
    }
  }
}