import { createClient } from "@/app/lib/supabase/server";
import CurrentRoundBoard from "./CurrentRoundBoard";
import StartNewRoundForm from "./StartNewRoundForm";
import { RoundHistoryList } from "./RoundHistoryList";

export default async function OfficialTournamentOverview({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const supabase = await createClient();

  const { data: squadRows } = await supabase
    .from("tournament_squad")
    .select("player_details(id, efootball_username)")
    .eq("tournament_id", tournamentId);

  const falconSquad = (squadRows ?? [])
    .map((s: any) => (Array.isArray(s.player_details) ? s.player_details[0] : s.player_details))
    .filter(Boolean);

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent_name, opponent_logo_url, round_stage, match_date, status, score_home, score_away")
    .eq("tournament_id", tournamentId)
    .order("match_date", { ascending: false });

  const currentMatch = (matches ?? []).find((m) => m.status !== "completed") ?? null;
  const history = (matches ?? []).filter((m) => m.status === "completed") as any[];

  let currentBattles: any[] = [];
  if (currentMatch) {
    const { data: battleRows } = await supabase
      .from("match_squad_battles")
      .select(
        "id, falcon_player_id, opponent_label, opponent_logo_url, falcon_score, opponent_score, player_details:falcon_player_id(efootball_username)"
      )
      .eq("match_id", currentMatch.id)
      .order("battle_order");

    currentBattles = (battleRows ?? []).map((b: any) => ({
      id: b.id,
      falcon_player_id: b.falcon_player_id,
      falcon_username: Array.isArray(b.player_details)
        ? b.player_details[0]?.efootball_username
        : b.player_details?.efootball_username ?? "Unknown",
      opponent_label: b.opponent_label,
      opponent_logo_url: b.opponent_logo_url,
      falcon_score: b.falcon_score,
      opponent_score: b.opponent_score,
    }));
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Current round */}
      <div>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
          Current Round
        </h2>
        {currentMatch ? (
          <CurrentRoundBoard
            matchId={currentMatch.id}
            opponentName={currentMatch.opponent_name}
            opponentLogoUrl={currentMatch.opponent_logo_url}
            roundStage={currentMatch.round_stage}
            battles={currentBattles}
          />
        ) : (
          <StartNewRoundForm tournamentId={tournamentId} falconSquad={falconSquad} />
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
          Round History ({history.length})
        </h2>
        <RoundHistoryList items={history} />
      </div>
    </div>
  );
}