import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import PendingPageClient from "@/app/components/dashboard/PendingPageClient";

export default async function PendingUsersPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data } = await supabase
    .from("player_details")
    .select("id, slug, efootball_username, real_name, avatar_url, country, city, platform, join_date")
    .eq("membership_status", "pending")
    .order("join_date", { ascending: true });

  return <PendingPageClient initialPlayers={data ?? []} />;
}
