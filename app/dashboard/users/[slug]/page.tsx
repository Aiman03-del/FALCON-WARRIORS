import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getPlayerBySlug } from "@/app/lib/queries/profile";
import { getPlayerForm } from "@/app/lib/queries/playerForm";
import UserProfileView from "@/app/components/dashboard/UserProfileView";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentRole = "player";
  if (user) {
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    currentRole = myProfile?.role ?? "player";
  }
  const isAdmin = currentRole === "admin";

  const player = await getPlayerBySlug(slug);
  if (!player) return notFound();

  const form = await getPlayerForm(player.id);

  return <UserProfileView player={player} form={form} isAdmin={isAdmin} />;
}