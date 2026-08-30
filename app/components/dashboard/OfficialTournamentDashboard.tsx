import { createClient } from "@/app/lib/supabase/client";
import CurrentRoundBoard from "@/app/components/dashboard/CurrentRoundBoard";
import OfficialTournamentTabs, {
  type OfficialTournamentTab,
} from "@/app/components/dashboard/OfficialTournamentTabs";
import ParticipantsBenchList from "@/app/components/dashboard/ParticipantsBenchList";
import { RoundHistoryList } from "@/app/components/dashboard/RoundHistoryList";
import StartNewRoundForm from "@/app/components/dashboard/StartNewRoundForm";
import TournamentForm from "@/app/components/dashboard/TournamentForm";

type FalconSquadPlayer = {
  id: string;
  efootball_username?: string | null;
  real_name?: string | null;
  avatar_url?: string | null;
  is_benched: boolean;
};

type SquadRow = {
  is_benched?: boolean | null;
  player_details?: FalconSquadPlayer | FalconSquadPlayer[] | null;
};

type BattleRow = {
  id: string;
  falcon_player_id: string | null;
  opponent_label: string | null;
  opponent_logo_url: string | null;
  falcon_score: number | null;
  opponent_score: number | null;
  player_details?:
    | (FalconSquadPlayer & { real_name?: string | null; avatar_url?: string | null })
    | (FalconSquadPlayer & { real_name?: string | null; avatar_url?: string | null })[]
    | null;
};

type CurrentBattle = {
  id: string;
  falcon_player_id: string | null;
  falcon_username: string;
  falcon_avatar_url: string | null;
  opponent_label: string;
  opponent_logo_url: string | null;
  falcon_score: number | null;
  opponent_score: number | null;
};

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
      "id, slug, name, type, format, double_round, two_leg_knockout, grand_final_reset, swiss_rounds, status, start_date, end_date, max_participants, registration_deadline, group_count, qualifiers_per_group, playoff_size, bye_method, third_place_match"
    )
    .eq("id", tournamentId)
    .single();

  if (!tournament) return null;

  const { data: squadRows } = await supabase
    .from("tournament_squad")
    .select("is_benched, player_details(id, efootball_username, real_name, avatar_url)")
    .eq("tournament_id", tournamentId);

  const falconSquad = ((squadRows as SquadRow[] | null) ?? [])
    .map((s) => {
      const pd = Array.isArray(s.player_details) ? s.player_details[0] : s.player_details;
      return pd ? { ...pd, is_benched: s.is_benched ?? false } : null;
    })
    .filter((player): player is FalconSquadPlayer => Boolean(player))
    .map((player) => ({
      ...player,
      efootball_username: player.efootball_username?.trim() || "Unknown",
    }));

  const playingSquad = falconSquad.filter((p) => !p.is_benched);

  const { data: matches } = await supabase
    .from("matches")
    .select("id, slug, opponent_name, opponent_logo_url, round_stage, match_date, status, score_home, score_away")
    .eq("tournament_id", tournamentId)
    .order("match_date", { ascending: false });

  const currentMatch = (matches ?? []).find((m) => m.status !== "completed") ?? null;
  const history = (matches ?? []).filter((m) => m.status === "completed");

  let currentBattles: CurrentBattle[] = [];
  if (currentMatch) {
    const { data: battleRows } = await supabase
      .from("match_squad_battles")
      .select(
        "id, falcon_player_id, opponent_label, opponent_logo_url, falcon_score, opponent_score, player_details:falcon_player_id(efootball_username, real_name, avatar_url)"
      )
      .eq("match_id", currentMatch.id)
      .order("battle_order");

    const benchedIds = new Set(falconSquad.filter((p) => p.is_benched).map((p) => p.id));

    currentBattles = ((battleRows as BattleRow[] | null) ?? [])
      .map((b) => {
        const pd = Array.isArray(b.player_details) ? b.player_details[0] : b.player_details;
        return {
          id: b.id,
          falcon_player_id: b.falcon_player_id,
          falcon_username: pd?.real_name?.trim() || pd?.efootball_username || "Unknown",
          falcon_avatar_url: pd?.avatar_url ?? null,
          opponent_label: b.opponent_label ?? "TBD",
          opponent_logo_url: b.opponent_logo_url,
          falcon_score: b.falcon_score,
          opponent_score: b.opponent_score,
        };
      })
      .filter((b) => b.falcon_player_id == null || !benchedIds.has(b.falcon_player_id));
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
          <StartNewRoundForm tournamentId={tournamentId} falconSquad={playingSquad} />
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
      <ParticipantsBenchList tournamentId={tournamentId} players={falconSquad} />
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