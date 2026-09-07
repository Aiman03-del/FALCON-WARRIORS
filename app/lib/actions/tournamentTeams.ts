"use server";

import { createClient } from "@/app/lib/supabase/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function getCurrentPlayerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("player_details").select("id").eq("profile_id", user.id).single();
  return data?.id ?? null;
}

async function isStaff(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin" || data?.role === "moderator";
}

export async function createTeam(tournamentId: string, teamName: string) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };

  const { data: participant } = await supabase.from("tournament_participants").select("status").eq("tournament_id", tournamentId).eq("player_id", playerId).single();
  if (participant?.status !== "approved") return { ok: false as const, error: "You must be an approved participant first." };

  const { data: existing } = await supabase.from("tournament_team_members").select("id").eq("tournament_id", tournamentId).eq("player_id", playerId).maybeSingle();
  if (existing) return { ok: false as const, error: "You're already in a team for this tournament." };

  const { data: team, error } = await supabase.from("tournament_teams").insert({ tournament_id: tournamentId, name: teamName, created_by: playerId }).select("id").single();
  if (error || !team) return { ok: false as const, error: error?.message ?? "Failed to create team" };

  const { error: memberError } = await supabase.from("tournament_team_members").insert({ team_id: team.id, tournament_id: tournamentId, player_id: playerId, role: "captain" });
  if (memberError) return { ok: false as const, error: memberError.message };

  revalidatePath("/dashboard/tournaments");
  revalidatePath("/tournaments");
  return { ok: true as const, teamId: team.id };
}

export async function joinTeam(tournamentId: string, teamId: string, teamSize: number) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };

  const { data: participant } = await supabase.from("tournament_participants").select("status").eq("tournament_id", tournamentId).eq("player_id", playerId).single();
  if (participant?.status !== "approved") return { ok: false as const, error: "You must be an approved participant first." };
  const { data: team } = await supabase.from("tournament_teams").select("id").eq("id", teamId).eq("tournament_id", tournamentId).maybeSingle();
  if (!team) return { ok: false as const, error: "Team not found." };

  const { data: existing } = await supabase.from("tournament_team_members").select("id").eq("tournament_id", tournamentId).eq("player_id", playerId).maybeSingle();
  if (existing) return { ok: false as const, error: "You're already in a team." };
  const { count } = await supabase.from("tournament_team_members").select("id", { count: "exact", head: true }).eq("team_id", teamId);
  if ((count ?? 0) >= teamSize) return { ok: false as const, error: "This team is already full." };

  const { error } = await supabase.from("tournament_team_members").insert({ team_id: teamId, tournament_id: tournamentId, player_id: playerId, role: "member" });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/tournaments");
  revalidatePath("/tournaments");
  return { ok: true as const };
}

export async function leaveTeam(tournamentId: string, teamId: string) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };
  const { data: member } = await supabase.from("tournament_team_members").select("id, role").eq("team_id", teamId).eq("tournament_id", tournamentId).eq("player_id", playerId).single();
  if (!member) return { ok: false as const, error: "You're not in this team." };

  const { error } = member.role === "captain"
    ? await supabase.from("tournament_teams").delete().eq("id", teamId).eq("tournament_id", tournamentId)
    : await supabase.from("tournament_team_members").delete().eq("id", member.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/tournaments");
  revalidatePath("/tournaments");
  return { ok: true as const };
}

export async function setTeamStatus(teamId: string, status: "approved" | "rejected") {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };
  const { error } = await supabase.from("tournament_teams").update({ status }).eq("id", teamId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/tournaments");
  revalidatePath("/tournaments");
  return { ok: true as const };
}

export async function adminAssignPlayerToTeam(tournamentId: string, playerId: string, teamId: string | null) {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };
  await supabase.from("tournament_team_members").delete().eq("tournament_id", tournamentId).eq("player_id", playerId);
  if (teamId) {
    const { data: team } = await supabase.from("tournament_teams").select("id").eq("id", teamId).eq("tournament_id", tournamentId).maybeSingle();
    if (!team) return { ok: false as const, error: "Team not found." };
    const { error } = await supabase.from("tournament_team_members").insert({ team_id: teamId, tournament_id: tournamentId, player_id: playerId, role: "member" });
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function randomGenerateTeams(tournamentId: string, teamSize: number, namePrefix = "Team") {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };
  const admin = createAdminClient();
  const { data: approved } = await admin.from("tournament_participants").select("player_id").eq("tournament_id", tournamentId).eq("status", "approved");
  const { data: alreadyInTeam } = await admin.from("tournament_team_members").select("player_id").eq("tournament_id", tournamentId);
  const assignedIds = new Set((alreadyInTeam ?? []).map((member) => member.player_id));
  const unassigned = (approved ?? []).map((participant) => participant.player_id).filter((id) => !assignedIds.has(id));
  if (unassigned.length < teamSize) return { ok: false as const, error: `Only ${unassigned.length} unassigned players — need at least ${teamSize}.` };

  for (let i = unassigned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unassigned[i], unassigned[j]] = [unassigned[j], unassigned[i]];
  }
  const { data: existingTeams } = await admin.from("tournament_teams").select("id").eq("tournament_id", tournamentId);
  let teamNumber = (existingTeams?.length ?? 0) + 1;
  const fullTeamsCount = Math.floor(unassigned.length / teamSize);

  for (let i = 0; i < fullTeamsCount; i++) {
    const slice = unassigned.slice(i * teamSize, (i + 1) * teamSize);
    const { data: team, error: teamError } = await admin.from("tournament_teams").insert({ tournament_id: tournamentId, name: `${namePrefix} ${teamNumber}`, status: "approved" }).select("id").single();
    if (teamError || !team) return { ok: false as const, error: teamError?.message ?? "Failed" };
    const { error: memberError } = await admin.from("tournament_team_members").insert(slice.map((playerId, idx) => ({ team_id: team.id, tournament_id: tournamentId, player_id: playerId, role: idx === 0 ? ("captain" as const) : ("member" as const) })));
    if (memberError) return { ok: false as const, error: memberError.message };
    teamNumber++;
  }
  revalidatePath("/dashboard/tournaments");
  return { ok: true as const, teamsCreated: fullTeamsCount, leftoverPlayers: unassigned.length % teamSize };
}
