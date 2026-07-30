import { notFound } from "next/navigation";
import MatchResultForm from "@/app/components/dashboard/MatchResultForm";
import CurrentRoundBoard from "@/app/components/dashboard/CurrentRoundBoard";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/client";

export default async function ManageMatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireStaff();
  const { slug } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, slug, opponent_name, opponent_logo_url, competition, match_date, status, score_home, score_away, match_type, tournament_id, round_stage, player1_id, player2_id, player1:player1_id(efootball_username), player2:player2_id(efootball_username)"
    )
    .eq("slug", slug)
    .single();

  if (!match) notFound();

  const p1 = Array.isArray(match.player1) ? match.player1[0] : match.player1;
  const p2 = Array.isArray(match.player2) ? match.player2[0] : match.player2;

  // ===== Official Tournament match (Squad Battle System) =====
  if (match.match_type === "external" && match.tournament_id) {
    const { data: battleRows } = await supabase
      .from("match_squad_battles")
      .select(
        "id, falcon_player_id, opponent_label, opponent_logo_url, falcon_score, opponent_score, player_details:falcon_player_id(efootball_username)"
      )
      .eq("match_id", match.id)
      .order("battle_order");

    const battles = (battleRows ?? []).map((b: any) => {
      const pd = Array.isArray(b.player_details) ? b.player_details[0] : b.player_details;
      return {
        id: b.id,
        falcon_player_id: b.falcon_player_id,
        falcon_username: pd?.efootball_username ?? "Unknown",
        opponent_label: b.opponent_label ?? "Opponent",
        opponent_logo_url: b.opponent_logo_url,
        falcon_score: b.falcon_score,
        opponent_score: b.opponent_score,
      };
    });

    return (
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          vs {match.opponent_name}
          {match.round_stage ? ` (${match.round_stage})` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {match.competition ?? "Official"} · {new Date(match.match_date).toLocaleString()}
        </p>

        <div className="mt-6">
          <CurrentRoundBoard
            matchId={match.id}
            opponentName={match.opponent_name ?? ""}
            opponentLogoUrl={match.opponent_logo_url}
            roundStage={match.round_stage}
            battles={battles}
          />
        </div>
      </div>
    );
  }

  // ===== Internal match (single player vs player) =====
  const { data: players } = await supabase
    .from("player_details")
    .select("id, efootball_username")
    .order("efootball_username");

  const title =
    match.match_type === "internal"
      ? `${p1?.efootball_username ?? "?"} vs ${p2?.efootball_username ?? "?"}`
      : `vs ${match.opponent_name}${match.round_stage ? ` (${match.round_stage})` : ""}`;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{title}</h1>
      <p className="mt-1 text-sm text-muted">
        {match.competition ?? "Friendly"} · {new Date(match.match_date).toLocaleString()}
      </p>

      <MatchResultForm
        matchId={match.id}
        matchType={match.match_type}
        currentStatus={match.status}
        currentScoreHome={match.score_home}
        currentScoreAway={match.score_away}
        player1Id={match.player1_id ?? undefined}
        player2Id={match.player2_id ?? undefined}
        player1Name={p1?.efootball_username}
        player2Name={p2?.efootball_username}
        players={players ?? []}
        tournamentSquad={null}
      />
    </div>
  );
}