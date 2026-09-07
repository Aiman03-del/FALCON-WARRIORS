import { createClient } from "../supabase/server";

export type TeamMember = {
  id: string;
  player_id: string;
  role: "captain" | "member";
  player?: { efootball_username: string; real_name: string | null; avatar_url: string | null } | null;
};

export type TournamentTeam = {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  group_name: string | null;
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
    .select("id, name, status, group_name, points, matches_played, wins, draws, losses, goals_for, goals_against, manual_rank")
    .eq("tournament_id", tournamentId)
    .order("created_at");

  if (error) throw error;
  if (!teams?.length) return [];

  const { data: members, error: membersError } = await supabase
    .from("tournament_team_members")
    .select("id, team_id, player_id, role, player_details(efootball_username, real_name, avatar_url)")
    .in("team_id", teams.map((team) => team.id));

  if (membersError) throw membersError;

  return teams.map((team) => ({
    ...team,
    status: team.status as TournamentTeam["status"],
    members: (members ?? [])
      .filter((member) => member.team_id === team.id)
      .map((member) => ({
        id: member.id,
        player_id: member.player_id,
        role: member.role as TeamMember["role"],
        player: Array.isArray(member.player_details) ? member.player_details[0] : member.player_details,
      })),
  }));
}
