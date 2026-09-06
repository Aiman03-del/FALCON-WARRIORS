import { createClient } from "../supabase/client";

export type UnifiedMatch = {
  id: string;
  href: string;
  matchType: "official" | "internal";
  homeName: string;
  homeAvatarUrl: string | null;
  homeIsFalcon: boolean;
  opponentName: string;
  opponentTag: string | null;
  opponentLogoUrl: string | null;
  competition: string | null;
  matchDate: string;
  status: string;
  scoreHome: number | null;
  scoreAway: number | null;
  tournamentId: string | null;
};

export async function getUnifiedMatches(params: { status?: string } = {}): Promise<UnifiedMatch[]> {
  const supabase = await createClient();

  let officialQuery = supabase
    .from("matches")
    .select(
      `id, slug, opponent_name, opponent_tag, opponent_logo_url, competition, round_stage, match_date, status, score_home, score_away, tournament_id, tournaments(type)`
    )
    .order("match_date", { ascending: false });

  let internalQuery = supabase
    .from("tournament_matches")
    .select(
      `id, status, player1_score, player2_score, created_at, tournament_id, round,
       tournaments!inner(type, name, slug),
       player1:player1_id(efootball_username, real_name, avatar_url),
       player2:player2_id(efootball_username, real_name, avatar_url)`
    )
    .eq("tournaments.type", "internal")
    .order("created_at", { ascending: false });

  if (params.status) {
    officialQuery = officialQuery.eq("status", params.status);
    internalQuery = internalQuery.eq("status", params.status);
  }

  const [{ data: officialData, error: err1 }, { data: internalData, error: err2 }] =
    await Promise.all([officialQuery, internalQuery]);

  if (err1) console.error("[getUnifiedMatches] official query failed:", err1);
  if (err2) console.error("[getUnifiedMatches] internal query failed:", err2);

  // Exclude ad-hoc friendly matches and keep only tournament-linked official matches.
  const official: UnifiedMatch[] = (officialData ?? [])
    .filter((m: any) => m.tournament_id)
    .map((m: any) => ({
      id: m.id,
      href: `/matches/${m.slug ?? m.id}`,
      matchType: "official" as const,
      homeName: "Falcon Warriors",
      homeAvatarUrl: null,
      homeIsFalcon: true,
      opponentName: m.opponent_name ?? "Opponent",
      opponentTag: m.opponent_tag ?? null,
      opponentLogoUrl: m.opponent_logo_url ?? null,
      competition: m.competition ?? m.round_stage,
      matchDate: m.match_date,
      status: m.status,
      scoreHome: m.score_home,
      scoreAway: m.score_away,
      tournamentId: m.tournament_id,
    }));

  const internal: UnifiedMatch[] = (internalData ?? []).map((m: any) => {
    const p1 = Array.isArray(m.player1) ? m.player1[0] : m.player1;
    const p2 = Array.isArray(m.player2) ? m.player2[0] : m.player2;
    const tournament = Array.isArray(m.tournaments) ? m.tournaments[0] : m.tournaments;

    return {
      id: m.id,
      href: `/tournaments/${tournament?.slug}/matches/${m.id}`,
      matchType: "internal" as const,
      homeName: p1?.real_name?.trim() || p1?.efootball_username || "TBD",
      homeAvatarUrl: p1?.avatar_url ?? null,
      homeIsFalcon: false,
      opponentName: p2?.real_name?.trim() || p2?.efootball_username || "TBD",
      opponentTag: null,
      opponentLogoUrl: p2?.avatar_url ?? null,
      competition: tournament?.name ?? `Round ${m.round}`,
      matchDate: m.created_at,
      status: m.status,
      scoreHome: m.player1_score,
      scoreAway: m.player2_score,
      tournamentId: m.tournament_id,
    };
  });

  return [...official, ...internal].sort(
    (a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
  );
}
