"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [academicFilter, setAcademicFilter] = useState<"all" | "academic" | "non-academic">("all");

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

  const tabFiltered = activeTab === "staff" ? staff : regularPlayers;

  const filtered = tabFiltered.filter((p) => {
    const name = (p.real_name?.trim() || p.efootball_username).toLowerCase();
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query || name.includes(query) || p.efootball_username.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ? true : p.membership_status === statusFilter;

    const matchesAcademic =
      academicFilter === "all"
        ? true
        : academicFilter === "academic"
        ? p.is_academic_player
        : !p.is_academic_player;

    return matchesSearch && matchesStatus && matchesAcademic;
  });

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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 pl-9 text-sm outline-none transition-colors focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-gold/60"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        {activeTab === "players" && (
          <select
            value={academicFilter}
            onChange={(e) => setAcademicFilter(e.target.value as typeof academicFilter)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none focus:border-gold/60"
          >
            <option value="all">All Players</option>
            <option value="academic">Academic Only</option>
            <option value="non-academic">Non-Academic Only</option>
          </select>
        )}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">No users match your search or filter.</p>
      ) : (
        <UsersTable players={filtered} isAdmin={isAdmin} onRefresh={fetchUsers} />
      )}
    </div>
  );
}