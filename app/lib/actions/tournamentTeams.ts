"use server";

import { createClient } from "@/app/lib/supabase/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function getCurrentPlayerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("player_details").select("id").eq("profile_id", user.id).single();
  return data?.id ?? null;
}

async function isStaff(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin" || data?.role === "moderator";
}

export async function createTeam(tournamentId: string, teamName: string) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };

  const { data: participant } = await supabase
    .from("tournament_participants")
    .select("status")
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId)
    .single();

  if (participant?.status !== "approved") {
    return { ok: false as const, error: "You must be an approved participant first." };
  }

  const { data: existing } = await supabase
    .from("tournament_team_members")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (existing) return { ok: false as const, error: "You're already in a team for this tournament." };

  const { data: team, error } = await supabase
    .from("tournament_teams")
    .insert({ tournament_id: tournamentId, name: teamName, created_by: playerId })
    .select("id")
    .single();

  if (error || !team) return { ok: false as const, error: error?.message ?? "Failed to create team" };

  const { error: memberError } = await supabase.from("tournament_team_members").insert({
    team_id: team.id,
    tournament_id: tournamentId,
    player_id: playerId,
    role: "captain",
    position: 1,
  });

  if (memberError) return { ok: false as const, error: memberError.message };

  revalidatePath("/dashboard/tournaments");
  return { ok: true as const, teamId: team.id };
}

export async function joinTeam(tournamentId: string, teamId: string, teamSize: number) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("tournament_team_members")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (existing) return { ok: false as const, error: "You're already in a team." };

  const { count } = await supabase
    .from("tournament_team_members")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);

  if ((count ?? 0) >= teamSize) return { ok: false as const, error: "This team is already full." };

  const { error } = await supabase.from("tournament_team_members").insert({
    team_id: teamId,
    tournament_id: tournamentId,
    player_id: playerId,
    role: "member",
    position: (count ?? 0) + 1,
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function leaveTeam(tournamentId: string, teamId: string) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("teams_locked")
    .eq("id", tournamentId)
    .single();

  if (tournament?.teams_locked) return { ok: false as const, error: "Teams are locked — you can't leave now." };

  const { data: member } = await supabase
    .from("tournament_team_members")
    .select("id, role")
    .eq("team_id", teamId)
    .eq("player_id", playerId)
    .single();

  if (!member) return { ok: false as const, error: "You're not in this team." };

  if (member.role === "captain") {
    await supabase.from("tournament_teams").delete().eq("id", teamId);
  } else {
    await supabase.from("tournament_team_members").delete().eq("id", member.id);
  }

  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function setTeamStatus(teamId: string, status: "approved" | "rejected") {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };

  const { error } = await supabase.from("tournament_teams").update({ status }).eq("id", teamId);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function adminAssignPlayerToTeam(tournamentId: string, playerId: string, teamId: string | null) {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };

  await supabase
    .from("tournament_team_members")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("player_id", playerId);

  if (teamId) {
    const { count } = await supabase
      .from("tournament_team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId);

    const { error } = await supabase.from("tournament_team_members").insert({
      team_id: teamId,
      tournament_id: tournamentId,
      player_id: playerId,
      role: "member",
      position: (count ?? 0) + 1,
    });
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function randomGenerateTeams(tournamentId: string, teamSize: number, namePrefix = "Team") {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };

  const admin = createAdminClient();

  const { data: approved } = await admin
    .from("tournament_participants")
    .select("player_id")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  const { data: alreadyInTeam } = await admin
    .from("tournament_team_members")
    .select("player_id")
    .eq("tournament_id", tournamentId);

  const assignedIds = new Set((alreadyInTeam ?? []).map((m) => m.player_id));
  const unassigned = (approved ?? []).map((p) => p.player_id).filter((id) => !assignedIds.has(id));

  if (unassigned.length < teamSize) {
    return { ok: false as const, error: `Only ${unassigned.length} unassigned players — need at least ${teamSize}.` };
  }

  for (let i = unassigned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unassigned[i], unassigned[j]] = [unassigned[j], unassigned[i]];
  }

  const { data: existingTeams } = await admin
    .from("tournament_teams")
    .select("id")
    .eq("tournament_id", tournamentId);

  let teamNumber = (existingTeams?.length ?? 0) + 1;
  const fullTeamsCount = Math.floor(unassigned.length / teamSize);

  for (let i = 0; i < fullTeamsCount; i++) {
    const slice = unassigned.slice(i * teamSize, (i + 1) * teamSize);

    const { data: team, error: teamError } = await admin
      .from("tournament_teams")
      .insert({ tournament_id: tournamentId, name: `${namePrefix} ${teamNumber}`, status: "approved" })
      .select("id")
      .single();

    if (teamError || !team) return { ok: false as const, error: teamError?.message ?? "Failed" };

    const rows = slice.map((playerId, idx) => ({
      team_id: team.id,
      tournament_id: tournamentId,
      player_id: playerId,
      role: idx === 0 ? ("captain" as const) : ("member" as const),
      position: idx + 1,
    }));

    const { error: memberError } = await admin.from("tournament_team_members").insert(rows);
    if (memberError) return { ok: false as const, error: memberError.message };

    teamNumber++;
  }

  revalidatePath("/dashboard/tournaments");
  return {
    ok: true as const,
    teamsCreated: fullTeamsCount,
    leftoverPlayers: unassigned.length % teamSize,
  };
}

export async function approveParticipant(tournamentId: string, participantId: string, playerId: string) {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("is_team_tournament")
    .eq("id", tournamentId)
    .single();

  const { error: updateError } = await supabase
    .from("tournament_participants")
    .update({ status: "approved" })
    .eq("id", participantId);

  if (updateError) return { ok: false as const, error: updateError.message };

  if (tournament?.is_team_tournament) {
    const { data: team, error: teamError } = await supabase
      .from("tournament_teams")
      .insert({ tournament_id: tournamentId, name: "New Team", status: "approved", created_by: playerId })
      .select("id")
      .single();

    if (teamError || !team) return { ok: false as const, error: teamError?.message ?? "Failed to create solo team" };

    const { error: memberError } = await supabase.from("tournament_team_members").insert({
      team_id: team.id,
      tournament_id: tournamentId,
      player_id: playerId,
      role: "captain",
      position: 1,
    });

    if (memberError) return { ok: false as const, error: memberError.message };
  }

  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function createSoloTeamsForPlayers(tournamentId: string, playerIds: string[]) {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };

  for (const playerId of playerIds) {
    const { data: team, error: teamError } = await supabase
      .from("tournament_teams")
      .insert({ tournament_id: tournamentId, name: "New Team", status: "approved", created_by: playerId })
      .select("id")
      .single();

    if (teamError || !team) continue;

    await supabase.from("tournament_team_members").insert({
      team_id: team.id,
      tournament_id: tournamentId,
      player_id: playerId,
      role: "captain",
      position: 1,
    });
  }

  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function setLineupPosition(teamMemberId: string, position: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("tournament_team_members").update({ position }).eq("id", teamMemberId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function adminTransferCaptain(teamId: string, newCaptainPlayerId: string) {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };

  const { data: member } = await supabase
    .from("tournament_team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("player_id", newCaptainPlayerId)
    .maybeSingle();

  if (!member) return { ok: false as const, error: "This player is not a member of the team." };

  await supabase.from("tournament_team_members").update({ role: "member" }).eq("team_id", teamId).eq("role", "captain");

  const { error } = await supabase
    .from("tournament_team_members")
    .update({ role: "captain" })
    .eq("team_id", teamId)
    .eq("player_id", newCaptainPlayerId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function setTeamsLocked(tournamentId: string, locked: boolean) {
  const supabase = await createClient();
  if (!(await isStaff(supabase))) return { ok: false as const, error: "Forbidden" };

  const { error } = await supabase.from("tournaments").update({ teams_locked: locked }).eq("id", tournamentId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function updateTeamProfile(tournamentId: string, teamId: string, name: string, logoUrl: string) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("teams_locked")
    .eq("id", tournamentId)
    .single();
  if (tournament?.teams_locked) return { ok: false as const, error: "Teams are locked." };

  const { data: member } = await supabase
    .from("tournament_team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("player_id", playerId)
    .single();

  if (member?.role !== "captain") return { ok: false as const, error: "Only the captain can edit team info." };

  const { error } = await supabase
    .from("tournament_teams")
    .update({ name, logo_url: logoUrl || null })
    .eq("id", teamId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/tournaments");
  return { ok: true as const };
}
