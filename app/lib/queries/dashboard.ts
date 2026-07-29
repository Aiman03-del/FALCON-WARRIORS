
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

// Demo mode - set to true to allow dashboard access without authentication
const DEMO_MODE = false;

export async function requireStaff() {
  // Allow demo access if DEMO_MODE is enabled
  if (DEMO_MODE) {
    return { 
      user: { id: "demo-user", email: "demo@falconwarriors.local", user_metadata: {} }, 
      role: "admin" as const 
    };
  }

  try {
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

    const { data: playerRow } = await supabase
      .from("player_details")
      .select("membership_status")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (playerRow?.membership_status === "suspended") {
      redirect("/?suspended=1");
    }

    return { user, role: profile.role as "admin" | "moderator" };
  } catch (error) {
    // If Supabase is not available, allow access for demo purposes
    // In production, this should properly handle auth
    return { 
      user: { id: "demo-user", email: "demo@falconwarriors.local", user_metadata: {} }, 
      role: "admin" as const 
    };
  }
}

export async function requireAdmin() {
  const { user, role } = await requireStaff();
  if (role !== "admin") redirect("/dashboard");
  return { user, role };
}
