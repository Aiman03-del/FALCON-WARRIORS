import { createClient } from "../supabase/server";

export type TeamMember = {
  id: string;
  player_id: string;
  role: "captain" | "member";
  position: number | null;
  player?: { efootball_username: string; real_name: string | null; avatar_url: string | null } | null;
};

export type TournamentTeam = {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  group_name: string | null;
  logo_url: string | null;
  points: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  manual_rank: number | null;
  members: TeamMember[];
};

export async function getTournamentTeams(tournamentId: string): Promise<TournamentTeam[]> {
  const supabase = await createClient();

  const { data: teams, error } = await supabase
    .from("tournament_teams")
    .select(
      "id, name, status, group_name, logo_url, points, matches_played, wins, draws, losses, goals_for, goals_against, manual_rank"
    )
    .eq("tournament_id", tournamentId)
    .order("created_at");

  if (error) throw error;
  if (!teams?.length) return [];

  const { data: members, error: membersError } = await supabase
    .from("tournament_team_members")
    .select("id, team_id, player_id, role, position, player_details(efootball_username, real_name, avatar_url)")
    .in("team_id", teams.map((t) => t.id));

  if (membersError) throw membersError;

  return teams.map((team) => ({
    ...team,
    status: team.status as "pending" | "approved" | "rejected",
    members: (members ?? [])
      .filter((m) => m.team_id === team.id)
      .map((m) => ({
        id: m.id,
        player_id: m.player_id,
        role: m.role as "captain" | "member",
        position: m.position,
        player: Array.isArray(m.player_details) ? m.player_details[0] : m.player_details,
      })),
  }));
}

export type MyTeamInfo = {
  teamId: string;
  teamName: string;
  logoUrl: string | null;
  isCaptain: boolean;
  members: TeamMember[];
  sentInvites: { id: string; player_id: string; status: string; player?: { efootball_username: string } | null }[];
};

export async function getMyTeamInfo(tournamentId: string, playerId: string): Promise<MyTeamInfo | null> {
  const supabase = await createClient();

  const { data: myMembership } = await supabase
    .from("tournament_team_members")
    .select("team_id, role")
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (!myMembership) return null;

  const { data: team } = await supabase
    .from("tournament_teams")
    .select("id, name, logo_url")
    .eq("id", myMembership.team_id)
    .single();

  if (!team) return null;

  const { data: members } = await supabase
    .from("tournament_team_members")
    .select("id, team_id, player_id, role, position, player_details(efootball_username, real_name, avatar_url)")
    .eq("team_id", team.id);

  const { data: sentInvites } = await supabase
    .from("team_invites")
    .select("id, player_id, status, player_details:player_id(efootball_username)")
    .eq("team_id", team.id)
    .order("created_at", { ascending: false });

  return {
    teamId: team.id,
    teamName: team.name,
    logoUrl: team.logo_url,
    isCaptain: myMembership.role === "captain",
    members: (members ?? []).map((m) => ({
      id: m.id,
      player_id: m.player_id,
      role: m.role as "captain" | "member",
      position: m.position,
      player: Array.isArray(m.player_details) ? m.player_details[0] : m.player_details,
    })),
    sentInvites: (sentInvites ?? []).map((i) => ({
      id: i.id,
      player_id: i.player_id,
      status: i.status,
      player: Array.isArray(i.player_details) ? i.player_details[0] : i.player_details,
    })),
  };
}

export async function getRecruitablePlayers(tournamentId: string, excludeTeamId: string) {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("tournament_team_members")
    .select("player_id, team_id")
    .eq("tournament_id", tournamentId);

  const counts = new Map<string, string[]>();
  (members ?? []).forEach((m) => {
    const arr = counts.get(m.team_id) ?? [];
    arr.push(m.player_id);
    counts.set(m.team_id, arr);
  });

  const soloPlayerIds: string[] = [];
  counts.forEach((playerIds, teamId) => {
    if (teamId !== excludeTeamId && playerIds.length === 1) soloPlayerIds.push(playerIds[0]);
  });

  if (soloPlayerIds.length === 0) return [];

  const { data: players } = await supabase
    .from("player_details")
    .select("id, efootball_username, real_name")
    .in("id", soloPlayerIds);

  return players ?? [];
}
