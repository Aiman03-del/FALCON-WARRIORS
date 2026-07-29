import { createClient } from "../supabase/client";

type MatchQueryParams = {
  status?: string;
  search?: string;
  type?: string;
};

export async function getMatches(params: MatchQueryParams = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("matches")
    .select(
      `id, opponent_name, opponent_tag, opponent_logo_url, competition, round_stage, match_date, status, score_home, score_away, match_type, tournament_id`
    )
    .order("match_date", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.type) {
    if (params.type === "official") {
      query = query.not("tournament_id", "is", null);
    } else if (params.type === "unofficial") {
      query = query.is("tournament_id", null);
    } else {
      query = query.eq("match_type", params.type);
    }
  }

  if (params.search) {
    const normalized = params.search.trim();
    if (normalized) {
      query = query.ilike("opponent_name", `%${normalized}%`).or(
        `competition.ilike.%${normalized}%`
      );
    }
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data;
}