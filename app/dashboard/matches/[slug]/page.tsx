import { notFound, redirect } from "next/navigation";
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
      "id, slug, opponent_name, opponent_logo_url, competition, match_date, status, score_home, score_away, match_type, tournament_id, round_stage, player1_id, player2_id, player1:player1_id(efootball_username, real_name), player2:player2_id(efootball_username, real_name)"
    )
    .eq("slug", slug)
    .single();

  if (!match) {
    // matches টেবিলে না পেলে, এটা হয়তো একটা unofficial (tournament_matches) ম্যাচ —
    // সেক্ষেত্রে id হিসেবে param এসেছে, slug হিসেবে না
    const { data: internalMatch } = await supabase
      .from("tournament_matches")
      .select("id, tournament_id, tournaments!inner(slug)")
      .eq("id", slug)
      .single();

    if (internalMatch) {
      const tournament = Array.isArray(internalMatch.tournaments)
        ? internalMatch.tournaments[0]
        : internalMatch.tournaments;

      if (tournament?.slug) {
        redirect(`/dashboard/tournaments/${tournament.slug}`);
      }
    }

    notFound();
  }

  const p1 = Array.isArray(match.player1) ? match.player1[0] : match.player1;
  const p2 = Array.isArray(match.player2) ? match.player2[0] : match.player2;

  // ===== Official Tournament match (Squad Battle System) =====
  if (match.match_type === "external" && match.tournament_id) {
    const { data: battleRows } = await supabase
      .from("match_squad_battles")
      .select(
        "id, falcon_player_id, opponent_label, opponent_logo_url, falcon_score, opponent_score, player_details:falcon_player_id(efootball_username, real_name, avatar_url)"
      )
      .eq("match_id", match.id)
      .order("battle_order");

 type BattleRow = {
  id: string;
  falcon_player_id: string;
  opponent_label?: string | null;
  opponent_logo_url?: string | null;
  falcon_score: number;
  opponent_score: number;
  player_details?:
    | { efootball_username?: string | null; real_name?: string | null; avatar_url?: string | null }
    | { efootball_username?: string | null; real_name?: string | null; avatar_url?: string | null }[]
    | null;
};
 const battles = (battleRows as BattleRow[] | null ?? []).map((b) => {
  const pd = Array.isArray(b.player_details) ? b.player_details[0] : b.player_details;
  return {
    id: b.id,
    falcon_player_id: b.falcon_player_id,
    falcon_username: pd?.real_name?.trim() || pd?.efootball_username || "Unknown",
    falcon_avatar_url: pd?.avatar_url ?? null,
    opponent_label: b.opponent_label ?? "Opponent",
    opponent_logo_url: b.opponent_logo_url ?? null, // ?? null যোগ করা হলো
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
    .select("id, efootball_username, real_name")
    .order("efootball_username");

  const title =
    match.match_type === "internal"
      ? `${p1?.real_name?.trim() || p1?.efootball_username || "?"} vs ${p2?.real_name?.trim() || p2?.efootball_username || "?"}`
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
        player1Name={p1?.real_name?.trim() || p1?.efootball_username}
        player2Name={p2?.real_name?.trim() || p2?.efootball_username}
        players={players ?? []}
        tournamentSquad={null}
      />
    </div>
  );
}