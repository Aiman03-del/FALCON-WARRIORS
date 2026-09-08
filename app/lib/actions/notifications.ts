"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: player } = await supabase.from("player_details").select("id").eq("profile_id", user.id).single();
  if (!player) return;
  await supabase.from("notifications").update({ is_read: true }).eq("recipient_id", player.id).eq("is_read", false);
}
