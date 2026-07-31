import { createClient } from "@/app/lib/supabase/client";
import CurrentRoundBoard from "@/app/components/dashboard/CurrentRoundBoard";
import OfficialTournamentTabs, {
  type OfficialTournamentTab,
} from "@/app/components/dashboard/OfficialTournamentTabs";
import { RoundHistoryList } from "@/app/components/dashboard/RoundHistoryList";
import StartNewRoundForm from "@/app/components/dashboard/StartNewRoundForm";
import TournamentForm from "@/app/components/dashboard/TournamentForm";

export default async function OfficialTournamentDashboard({
  tournamentId,
  tournamentSlug,
  activeTab,
}: {
  tournamentId: string;
  tournamentSlug: string;
  activeTab: OfficialTournamentTab;
}) {
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select(
      "id, slug, name, type, format, double_round, status, start_date, end_date, max_participants, registration_deadline, group_count, qualifiers_per_group, playoff_size, bye_method, third_place_match"
    )
    .eq("id", tournamentId)
    .single();

  if (!tournament) return null;

  const { data: squadRows } = await supabase
    .from("tournament_squad")
    .select("player_details(id, efootball_username, avatar_url)")
    .eq("tournament_id", tournamentId);

  const falconSquad = (squadRows ?? [])
    .map((s: any) => (Array.isArray(s.player_details) ? s.player_details[0] : s.player_details))
    .filter(Boolean);

  const { data: matches } = await supabase
    .from("matches")
    .select("id, slug, opponent_name, opponent_logo_url, round_stage, match_date, status, score_home, score_away")
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

  const roundsContent = (
    <div className="flex flex-col gap-8">
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
    </div>
  );

  const historyContent = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
          Round History ({history.length})
        </h2>
      </div>
      <RoundHistoryList items={history} />
    </div>
  );

  const participantsContent =
    falconSquad.length > 0 ? (
      <div className="card divide-y divide-border">
        {falconSquad.map((player: any) => (
          <div key={player.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-medium">{player.efootball_username}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="card p-8 text-center text-sm text-muted">
        No participants added yet. Use the Edit tab to select the official squad.
      </div>
    );

  const editContent = (
    <TournamentForm mode="edit" tournamentId={tournament.id} initial={tournament} embedded />
  );

  return (
    <OfficialTournamentTabs
      tournamentId={tournamentId}
      tournamentSlug={tournamentSlug}
      activeTab={activeTab}
      roundsContent={roundsContent}
      historyContent={historyContent}
      participantsContent={participantsContent}
      editContent={editContent}
    />
  );
}
