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

export async function getRecruitablePlayers(tournamentId: string, excludeTeamId: string) {
  const supabase = await createClient();
  const { data: members } = await supabase.from("tournament_team_members").select("player_id, team_id").eq("tournament_id", tournamentId);
  const counts = new Map<string, string[]>();
  (members ?? []).forEach((member) => counts.set(member.team_id, [...(counts.get(member.team_id) ?? []), member.player_id]));
  const soloPlayerIds: string[] = [];
  counts.forEach((playerIds, teamId) => { if (teamId !== excludeTeamId && playerIds.length === 1) soloPlayerIds.push(playerIds[0]); });
  if (soloPlayerIds.length === 0) return [];
  const { data: players } = await supabase.from("player_details").select("id, efootball_username, real_name, avatar_url").in("id", soloPlayerIds);
  return players ?? [];
}

export async function sendTeamInvite(tournamentId: string, teamId: string, targetPlayerId: string) {
  const supabase = await createClient();
  const captainId = await getCurrentPlayerId(supabase);
  if (!captainId) return { ok: false as const, error: "Unauthorized" };
  const { data: tournament } = await supabase.from("tournaments").select("team_size, teams_locked").eq("id", tournamentId).single();
  if (tournament?.teams_locked) return { ok: false as const, error: "Teams are locked for this tournament." };
  const { data: captainRow } = await supabase.from("tournament_team_members").select("role").eq("team_id", teamId).eq("player_id", captainId).single();
  if (captainRow?.role !== "captain") return { ok: false as const, error: "Only the captain can send invites." };
  const { data: team } = await supabase.from("tournament_teams").select("name, logo_url").eq("id", teamId).eq("tournament_id", tournamentId).single();
  if (!team?.name || !team?.logo_url) return { ok: false as const, error: "Set your team name and logo before sending invites." };
  const { count } = await supabase.from("tournament_team_members").select("id", { count: "exact", head: true }).eq("team_id", teamId);
  if ((count ?? 0) >= (tournament?.team_size ?? 0)) return { ok: false as const, error: "Your team is already full." };
  const { data: invite, error } = await supabase.from("team_invites").insert({ tournament_id: tournamentId, team_id: teamId, invited_by: captainId, player_id: targetPlayerId }).select("id").single();
  if (error) return { ok: false as const, error: error.code === "23505" ? "This player already has a pending invite from your team." : error.message };
  const admin = createAdminClient();
  await admin.from("notifications").insert({ recipient_id: targetPlayerId, type: "team_invite", title: `${team.name} wants you on their team`, body: `You've been invited to join "${team.name}" for this tournament.`, related_invite_id: invite.id, related_tournament_id: tournamentId });
  revalidatePath("/dashboard/tournaments");
  revalidatePath("/tournaments");
  return { ok: true as const };
}

export async function cancelTeamInvite(inviteId: string) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };
  const { error } = await supabase.from("team_invites").update({ status: "cancelled", responded_at: new Date().toISOString() }).eq("id", inviteId).eq("invited_by", playerId).eq("status", "pending");
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/tournaments");
  return { ok: true as const };
}

export async function respondToTeamInvite(inviteId: string, accept: boolean) {
  const supabase = await createClient();
  const playerId = await getCurrentPlayerId(supabase);
  if (!playerId) return { ok: false as const, error: "Unauthorized" };
  const { data: invite } = await supabase
    .from("team_invites")
    .select("invited_by, team_id, tournament_id, tournaments(slug)")
    .eq("id", inviteId)
    .single();
  if (!invite) return { ok: false as const, error: "Invite not found." };
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("respond_to_team_invite", { p_invite_id: inviteId, p_player_id: playerId, p_accept: accept });
  if (error) return { ok: false as const, error: error.message };
  const result = data as { ok: boolean; error?: string; accepted?: boolean };
  if (!result.ok) return { ok: false as const, error: result.error ?? "Failed" };
  await admin.from("notifications").insert({ recipient_id: invite.invited_by, type: accept ? "invite_accepted" : "invite_rejected", title: accept ? "Your invite was accepted" : "Your invite was declined", related_tournament_id: invite.tournament_id });
  revalidatePath("/dashboard/tournaments");
  revalidatePath("/tournaments");
  const tournamentRel = invite.tournaments as unknown as { slug: string } | { slug: string }[] | null;
  const tournamentSlug = Array.isArray(tournamentRel) ? tournamentRel[0]?.slug ?? null : tournamentRel?.slug ?? null;
  return { ok: true as const, accepted: result.accepted, tournamentSlug };
}
