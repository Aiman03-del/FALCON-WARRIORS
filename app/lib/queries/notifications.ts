import { createClient } from "../supabase/server";

export async function getMyNotifications(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { notifications: [], unreadCount: 0 };
  const { data: player } = await supabase.from("player_details").select("id").eq("profile_id", user.id).single();
  if (!player) return { notifications: [], unreadCount: 0 };
  const { data: notifications } = await supabase.from("notifications").select("id, type, title, body, related_invite_id, related_tournament_id, is_read, created_at").eq("recipient_id", player.id).order("created_at", { ascending: false }).limit(limit);
  const { count: unreadCount } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("recipient_id", player.id).eq("is_read", false);
  return { notifications: notifications ?? [], unreadCount: unreadCount ?? 0 };
}
