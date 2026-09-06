import { createClient } from "../supabase/client";

type MatchQueryParams = {
  status?: string;
  search?: string;
  type?: string;
};

export async function getMatches(params: MatchQueryParams = {}) {
  const supabase = await createClient();

  // Official matches come from the matches table and only include official tournaments.
  let officialQuery = supabase
    .from("matches")
    .select(
      `id, slug, opponent_name, opponent_tag, opponent_logo_url, competition, round_stage, match_date, status, score_home, score_away, match_type, tournament_id, tournaments!inner(type)`
    )
    .eq("tournaments.type", "official")
    .order("match_date", { ascending: false });

  // Unofficial matches come from tournament_matches and only include internal tournaments.
  let internalQuery = supabase
    .from("tournament_matches")
    .select(
      `id, status, player1_score, player2_score, created_at, tournament_id, round,
       tournaments!inner(type, name, slug),
       player1:player1_id(efootball_username, real_name, avatar_url, slug),
       player2:player2_id(efootball_username, real_name, avatar_url, slug)`
    )
    .eq("tournaments.type", "internal")
    .order("created_at", { ascending: false });

  if (params.status) {
    officialQuery = officialQuery.eq("status", params.status);
    internalQuery = internalQuery.eq("status", params.status);
  }

  const wantOfficial = !params.type || params.type === "official";
  const wantUnofficial = !params.type || params.type === "unofficial";

  const [{ data: officialData, error: err1 }, { data: internalData, error: err2 }] =
    await Promise.all([
      wantOfficial ? officialQuery : Promise.resolve({ data: [], error: null }),
      wantUnofficial ? internalQuery : Promise.resolve({ data: [], error: null }),
    ]);

  if (err1) console.error("[getMatches] official query failed:", err1);
  if (err2) console.error("[getMatches] internal query failed:", err2);

  const normalizedOfficial = (officialData ?? []).map((m: any) => ({
    id: m.id,
    slug: m.slug,
    href: `/matches/${m.slug ?? m.id}`,
    homeName: undefined,
    homeAvatarUrl: null,
    opponent_name: m.opponent_name,
    opponent_tag: m.opponent_tag,
    opponent_logo_url: m.opponent_logo_url,
    competition: m.competition ?? m.round_stage,
    match_date: m.match_date,
    status: m.status,
    score_home: m.score_home,
    score_away: m.score_away,
    match_type: m.match_type,
    tournament_id: m.tournament_id,
  }));

  const normalizedInternal = (internalData ?? []).map((m: any) => {
    const p1 = Array.isArray(m.player1) ? m.player1[0] : m.player1;
    const p2 = Array.isArray(m.player2) ? m.player2[0] : m.player2;
    const tournament = Array.isArray(m.tournaments) ? m.tournaments[0] : m.tournaments;

    return {
      id: m.id,
      slug: null,
      href: `/tournaments/${tournament?.slug}/matches/${m.id}`,
      homeName: p1?.real_name?.trim() || p1?.efootball_username || "TBD",
      homeAvatarUrl: p1?.avatar_url ?? null,
      opponent_name: p2?.real_name?.trim() || p2?.efootball_username || "TBD",
      opponent_tag: null,
      opponent_logo_url: p2?.avatar_url ?? null,
      competition: tournament?.name ?? `Round ${m.round}`,
      match_date: m.created_at,
      status: m.status,
      score_home: m.player1_score,
      score_away: m.player2_score,
      match_type: "internal",
      tournament_id: m.tournament_id,
    };
  });

  let combined = [...normalizedOfficial, ...normalizedInternal];

  if (params.search) {
    const normalized = params.search.trim().toLowerCase();
    if (normalized) {
      combined = combined.filter(
        (m) =>
          m.opponent_name?.toLowerCase().includes(normalized) ||
          m.competition?.toLowerCase().includes(normalized)
      );
    }
  }

  return combined.sort(
    (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
  );
}