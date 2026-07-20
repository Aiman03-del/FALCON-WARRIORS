
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export async function requireStaff() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "moderator"].includes(profile.role)) {
    redirect("/");
  }

  return { user, role: profile.role as "admin" | "moderator" };
}

export async function requireAdmin() {
  const { user, role } = await requireStaff();
  if (role !== "admin") redirect("/dashboard");
  return { user, role };
}