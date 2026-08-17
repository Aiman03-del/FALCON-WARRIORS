"use client";

import { useEffect, useState } from "react";
import UsersTable from "@/app/components/dashboard/UsersTable";
import { createClient } from "@/app/lib/supabase/client";

type Player = {
  id: string;
  profile_id: string;
  slug: string;
  efootball_username: string;
  real_name?: string | null;
  avatar_url?: string | null;
  membership_status: string;
  join_date: string;
  is_academic_player: boolean;
  profiles: { role: string } | { role: string }[] | null;
};

function getRole(p: Player) {
  if (Array.isArray(p.profiles)) return p.profiles[0]?.role ?? "player";
  return p.profiles?.role ?? "player";
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "players">("staff");
  const [players, setPlayers] = useState<Player[]>([]);
  const [role, setRole] = useState<string>("player");
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole(myProfile?.role ?? "player");
    }

    const { data } = await supabase
      .from("player_details")
      .select(
        "id, profile_id, slug, efootball_username, real_name, avatar_url, membership_status, join_date, is_academic_player, profiles(role)"
      )
      .order("join_date", { ascending: false });

    setPlayers((data ?? []) as Player[]);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      await fetchUsers();
    })();
  }, []);

  const staff = players.filter((p) => getRole(p) === "admin" || getRole(p) === "moderator");
  const regularPlayers = players.filter((p) => getRole(p) === "player");
  const isAdmin = role === "admin";

  const filtered = activeTab === "staff" ? staff : regularPlayers;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        User Management
      </h1>
      <p className="mt-1 text-sm text-muted">
        {isAdmin ? "Assign roles, suspend or remove members." : "Review and approve player accounts."}
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-3 text-sm font-medium transition ${
            activeTab === "staff"
              ? "border-b-2 border-gold text-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          Admin & Staff ({staff.length})
        </button>
        <button
          onClick={() => setActiveTab("players")}
          className={`px-4 py-3 text-sm font-medium transition ${
            activeTab === "players"
              ? "border-b-2 border-gold text-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          Players ({regularPlayers.length})
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading...</p>
      ) : (
        <UsersTable players={filtered} isAdmin={isAdmin} onRefresh={fetchUsers} />
      )}
    </div>
  );
}