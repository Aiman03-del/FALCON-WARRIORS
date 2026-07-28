import UsersTable from "@/app/components/dashboard/UsersTable";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";

export default async function UsersPage() {
  const { role } = await requireStaff();
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("player_details")
    .select("id, profile_id, efootball_username, membership_status, join_date, profiles(role)")
    .order("join_date", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        User Management
      </h1>
      <p className="mt-1 text-sm text-muted">
        {role === "admin"
          ? "Assign roles, suspend, reactivate, or permanently delete members."
          : "Review and approve player accounts."}
      </p>

      <UsersTable players={players ?? []} isAdmin={role === "admin"} />
    </div>
  );
}