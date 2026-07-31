import { createClient } from "../supabase/client";
import { computeStandingsFromMatches } from "../fixtures/computeStandings";
import { rankStandings } from "../fixtures/tiebreakers";

type TournamentPlayerDetail = {
  id: string;
  slug?: string | null;
  efootball_username: string;
  real_name: string | null;
  avatar_url: string | null;
};

type TournamentParticipantRow = {
  id: string;
  player_id: string;
  group_name?: string | null;
  points?: number | null;
  status?: string | null;
  matches_played?: number | null;
  wins?: number | null;
  draws?: number | null;
  losses?: number | null;
  goals_for?: number | null;
  goals_against?: number | null;
  player_details?: TournamentPlayerDetail | TournamentPlayerDetail[] | null;
};

type TournamentMatchRow = {
  id: string;
  round: number;
  match_order?: number | null;
  player1_id?: string | null;
  player2_id?: string | null;
  player1_score?: number | null;
  player2_score?: number | null;
  winner_id?: string | null;
  status: string;
  stage?: string | null;
  group_name?: string | null;
  is_third_place?: boolean | null;
  player1?: TournamentPlayerDetail | TournamentPlayerDetail[] | null;
  player2?: TournamentPlayerDetail | TournamentPlayerDetail[] | null;
};

type TournamentSquadRow = {
  player_id: string;
  player_details?: TournamentPlayerDetail | TournamentPlayerDetail[] | null;
};

export type TournamentParticipant = {
  id: string;
  player_id: string;
  group_name?: string | null;
  status?: string | null;
  points: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  player_details: TournamentPlayerDetail | null;
};

export type TournamentMatch = {
  id: string;
  round: number;
  match_order: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  winner_id: string | null;
  status: string;
  stage?: string | null;
  group_name?: string | null;
  is_third_place: boolean;
  player1: TournamentPlayerDetail | null;
  player2: TournamentPlayerDetail | null;
};

export type TournamentSquadMember = {
  id: string;
  slug: string | null;
  efootball_username: string;
  real_name: string | null;
  avatar_url: string | null;
};

export type TournamentDetailData = {
  tournament: {
    id: string;
    slug: string | null;
    name: string;
    type: string;
    format: string | null;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    max_participants?: number | null;
    registration_deadline?: string | null;
    group_count?: number | null;
    qualifiers_per_group?: number | null;
    playoff_size?: number | null;
    third_place_match?: boolean | null;
  };
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  formMap: Record<string, Array<"W" | "D" | "L">>;
  squad: TournamentSquadMember[];
};

export async function getTournamentDetail(slug: string): Promise<TournamentDetailData | null> {
  const supabase = await createClient();

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(
      "id, slug, name, type, format, status, start_date, end_date, max_participants, registration_deadline, group_count, qualifiers_per_group, playoff_size, third_place_match"
    )
    .eq("slug", slug)
    .single();

  if (error) throw error;
  if (!tournament) return null;

  const id = tournament.id;

  const [{ data: participantsRaw }, { data: matchesRaw }, { data: squadRaw }] = await Promise.all([
    supabase
      .from("tournament_participants")
      .select(
        "id, player_id, group_name, points, status, matches_played, wins, draws, losses, goals_for, goals_against, player_details(id, efootball_username, real_name, avatar_url)"
      )
      .eq("tournament_id", id),
    supabase
      .from("tournament_matches")
      .select(
        "id, round, match_order, player1_id, player2_id, player1_score, player2_score, winner_id, status, stage, group_name, is_third_place, player1:player1_id(id, efootball_username, real_name, avatar_url), player2:player2_id(id, efootball_username, real_name, avatar_url)"
      )
      .eq("tournament_id", id)
      .order("round")
      .order("match_order"),
    supabase
      .from("tournament_squad")
      .select("player_id, player_details(id, slug, efootball_username, real_name, avatar_url)")
      .eq("tournament_id", id),
  ]);

  const participants = (participantsRaw ?? []).map((row: TournamentParticipantRow): TournamentParticipant => {
    const playerDetails = Array.isArray(row.player_details)
      ? row.player_details[0] ?? null
      : row.player_details ?? null;

    return {
      ...row,
      points: row.points ?? 0,
      matches_played: row.matches_played ?? 0,
      wins: row.wins ?? 0,
      draws: row.draws ?? 0,
      losses: row.losses ?? 0,
      goals_for: row.goals_for ?? 0,
      goals_against: row.goals_against ?? 0,
      player_details: playerDetails,
    };
  });

  const matches = (matchesRaw ?? []).map((row: TournamentMatchRow): TournamentMatch => {
    const player1 = Array.isArray(row.player1) ? row.player1[0] ?? null : row.player1 ?? null;
    const player2 = Array.isArray(row.player2) ? row.player2[0] ?? null : row.player2 ?? null;

    return {
      ...row,
      match_order: row.match_order ?? 0,
      player1_id: row.player1_id ?? null,
      player2_id: row.player2_id ?? null,
      player1_score: row.player1_score ?? null,
      player2_score: row.player2_score ?? null,
      winner_id: row.winner_id ?? null,
      is_third_place: row.is_third_place ?? false,
      player1,
      player2,
    };
  });

  const squad = (squadRaw ?? []).map((row: TournamentSquadRow): TournamentSquadMember => {
    const playerDetails = Array.isArray(row.player_details)
      ? row.player_details[0] ?? null
      : row.player_details ?? null;

    return {
      id: playerDetails?.id ?? row.player_id,
      slug: playerDetails?.slug ?? null,
      efootball_username: playerDetails?.efootball_username ?? "Unknown",
      real_name: playerDetails?.real_name ?? null,
      avatar_url: playerDetails?.avatar_url ?? null,
    };
  });

  const formMap: Record<string, Array<"W" | "D" | "L">> = {};
  for (const match of matches) {
    if (match.status !== "completed") continue;

    const outcomes: Array<"W" | "D" | "L"> = [];
    const player1Id = match.player1_id;
    const player2Id = match.player2_id;
    const p1Score = match.player1_score;
    const p2Score = match.player2_score;

    if (player1Id && p1Score != null && p2Score != null) {
      if (p1Score > p2Score) {
        outcomes.push("W");
      } else if (p1Score < p2Score) {
        outcomes.push("L");
      } else {
        outcomes.push("D");
      }
    }

    if (player2Id && p1Score != null && p2Score != null) {
      if (p2Score > p1Score) {
        outcomes.push("W");
      } else if (p2Score < p1Score) {
        outcomes.push("L");
      } else {
        outcomes.push("D");
      }
    }

    if (player1Id) {
      formMap[player1Id] = [...(formMap[player1Id] ?? []), outcomes[0] ?? "D"].slice(-5);
    }
    if (player2Id) {
      formMap[player2Id] = [...(formMap[player2Id] ?? []), outcomes[1] ?? "D"].slice(-5);
    }
  }

  return {
    tournament,
    participants,
    matches,
    formMap,
    squad,
  };
}

export async function getMyJoinStatus(tournamentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { loggedIn: false as const };

  const { data: player, error: playerError } = await supabase
    .from("player_details")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (playerError) throw playerError;
  if (!player) return { loggedIn: true as const, hasPlayerProfile: false as const };

  const { data: existing } = await supabase
    .from("tournament_participants")
    .select("id, status")
    .eq("tournament_id", tournamentId)
    .eq("player_id", player.id)
    .maybeSingle();

  const { count: approvedCount } = await supabase
    .from("tournament_participants")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  return {
    loggedIn: true as const,
    hasPlayerProfile: true as const,
    playerId: player.id,
    myRequestStatus: existing?.status ?? null,
    approvedCount: approvedCount ?? 0,
  };
}

export async function getTournamentStandings(tournamentId: string) {
  const supabase = await createClient();

  const { data: participants, error } = await supabase
    .from("tournament_participants")
    .select("id, player_id, points, matches_played, wins, draws, losses, goals_for, goals_against, manual_rank, player_details(id, efootball_username)")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (error) throw error;
  if (!participants) return [];

  const { data: rawMatches } = await supabase
    .from("tournament_matches")
    .select("player1_id, player2_id, player1_score, player2_score, status, stage")
    .eq("tournament_id", tournamentId)
    .eq("status", "completed");

  const matches = (rawMatches ?? []).filter((m) => m.stage !== "knockout");

  const statsMap = computeStandingsFromMatches(
    participants.map((p) => p.player_id),
    matches
  );

  const withComputed = participants.map((p) => {
    const stats = statsMap[p.player_id];
    return {
      ...p,
      ...stats,
      playerId: p.player_id,
      matchesPlayed: stats.matches_played,
      goalsFor: stats.goals_for,
      goalsAgainst: stats.goals_against,
      goalDifference: stats.goals_for - stats.goals_against,
      player: p.player_details,
    };
  });

  return rankStandings(withComputed, matches ?? []);
}

export async function getGroupStandings(tournamentId: string) {
  const supabase = await createClient();

  const { data: participants, error } = await supabase
    .from("tournament_participants")
    .select(
      "id, player_id, group_name, points, matches_played, wins, draws, losses, goals_for, goals_against, manual_rank, player_details(id, efootball_username, real_name, avatar_url)"
    )
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (error) throw error;

  const { data: rawMatches } = await supabase
    .from("tournament_matches")
    .select("player1_id, player2_id, player1_score, player2_score, status, stage, group_name")
    .eq("tournament_id", tournamentId)
    .eq("status", "completed");

  type GroupParticipantRow = {
    id: string;
    player_id: string;
    group_name?: string | null;
    points?: number | null;
    matches_played?: number | null;
    wins?: number | null;
    draws?: number | null;
    losses?: number | null;
    goals_for?: number | null;
    goals_against?: number | null;
    manual_rank?: number | null;
    player_details?: TournamentPlayerDetail | TournamentPlayerDetail[] | null;
  };

  const groups: Record<string, GroupParticipantRow[]> = {};
  for (const p of participants ?? []) {
    const key = p.group_name ?? "Ungrouped";
    (groups[key] ??= []).push(p);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, rows]) => {
      const groupMatches = (rawMatches ?? []).filter(
        (m) => m.stage === "group" && m.group_name === groupName
      );
      const statsMap = computeStandingsFromMatches(
        rows.map((p) => p.player_id),
        groupMatches
      );
      const withStats = rows.map((p) => {
        const playerDetails = Array.isArray(p.player_details)
          ? p.player_details[0] ?? null
          : p.player_details ?? null;
        return { ...p, ...statsMap[p.player_id], player_details: playerDetails };
      });
      return { groupName, standings: rankStandings(withStats, groupMatches) };
    });
}

export async function getTournamentUpcomingMatches(tournamentId: string) {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("tournament_matches")
    .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, status, player1:player1_id(efootball_username, avatar_url), player2:player2_id(efootball_username, avatar_url)")
      .eq("tournament_id", tournamentId)
      .in("status", ["pending", "live"])
      .order("round")
      .order("match_order");

  if (error) throw error;
  return matches ?? [];
}

export async function getTournamentCompletedMatches(tournamentId: string) {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("tournament_matches")
    .select("id, round, match_order, player1_id, player2_id, player1_score, player2_score, status, player1:player1_id(efootball_username, avatar_url), player2:player2_id(efootball_username, avatar_url)")
      .eq("tournament_id", tournamentId)
      .eq("status", "completed")
      .order("round", { ascending: false })
      .order("match_order", { ascending: false });

  if (error) throw error;
  return matches ?? [];
}

export type OfficialTournamentMatch = {
  id: string;
  slug: string | null;
  opponent_name: string;
  opponent_logo_url: string | null;
  match_date: string | null;
  score_home: number | null;
  score_away: number | null;
  status: string;
  round_stage: string | null;
  competition: string | null;
};

export async function getOfficialTournamentMatches(
  tournamentId: string
): Promise<OfficialTournamentMatch[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, slug, opponent_name, opponent_logo_url, match_date, score_home, score_away, status, round_stage, competition"
    )
    .eq("tournament_id", tournamentId)
    .order("match_date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((m) => ({
    ...m,
    match_date: m.match_date ?? null,
    score_home: m.score_home ?? null,
    score_away: m.score_away ?? null,
  }));
}

export type PublicMatchDetail = {
  id: string;
  slug: string | null;
  opponent_name: string;
  opponent_logo_url: string | null;
  match_date: string | null;
  score_home: number | null;
  score_away: number | null;
  status: string;
  round_stage: string | null;
  competition: string | null;
  battles: {
    id: string;
    falcon_player_id: string | null;
    falcon_username: string;
    opponent_label: string;
    opponent_logo_url: string | null;
    falcon_score: number | null;
    opponent_score: number | null;
  }[];
  motmList: {
    scorer_id: string | null;
    opponent_label: string | null;
    display: string;
    avatar_url: string | null;
  }[];
};

export async function getPublicMatchDetail(
  matchSlug: string
): Promise<PublicMatchDetail | null> {
  const supabase = await createClient();

  const { data: match, error } = await supabase
    .from("matches")
    .select(
      "id, slug, opponent_name, opponent_logo_url, match_date, score_home, score_away, status, round_stage, competition"
    )
    .eq("slug", matchSlug)
    .single();

  if (error || !match) return null;

  const [{ data: battlesRaw }, { data: motmRaw }] = await Promise.all([
    supabase
      .from("match_squad_battles")
      .select(
        "id, falcon_player_id, opponent_label, opponent_logo_url, falcon_score, opponent_score, player_details:falcon_player_id(efootball_username, real_name)"
      )
      .eq("match_id", match.id),
    supabase
      .from("match_events")
      .select(
        "scorer_id, opponent_label, player_details:scorer_id(id, efootball_username, real_name, avatar_url)"
      )
      .eq("match_id", match.id)
      .eq("event_type", "motm"),
  ]);

  const battles = (battlesRaw ?? []).map((b) => {
    const pd = Array.isArray(b.player_details) ? b.player_details[0] : b.player_details;
    const p = pd as { efootball_username?: string; real_name?: string | null } | null;
    return {
      id: b.id,
      falcon_player_id: b.falcon_player_id ?? null,
      falcon_username: p?.real_name?.trim() || p?.efootball_username || "Unknown",
      opponent_label: b.opponent_label ?? "Opponent",
      opponent_logo_url: b.opponent_logo_url ?? null,
      falcon_score: b.falcon_score ?? null,
      opponent_score: b.opponent_score ?? null,
    };
  });

  const motmList = (motmRaw ?? []).map((m) => {
    const pd = Array.isArray(m.player_details) ? m.player_details[0] : m.player_details;
    const p = pd as {
      id?: string;
      efootball_username?: string;
      real_name?: string | null;
      avatar_url?: string | null;
    } | null;

    if (m.opponent_label) {
      return {
        scorer_id: null,
        opponent_label: m.opponent_label,
        display: m.opponent_label,
        avatar_url: null,
      };
    }

    return {
      scorer_id: m.scorer_id ?? null,
      opponent_label: null,
      display: p?.real_name?.trim() || p?.efootball_username || "Unknown",
      avatar_url: p?.avatar_url ?? null,
    };
  });

  return {
    ...match,
    match_date: match.match_date ?? null,
    score_home: match.score_home ?? null,
    score_away: match.score_away ?? null,
    battles,
    motmList,
  };
}