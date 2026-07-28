"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmActionButton from "@/app/components/ConfirmActionButton";
import { deleteUserAccount } from "@/app/lib/actions/deleteUser";

type Player = {
  id: string;
  profile_id: string;
  efootball_username: string;
  membership_status: string;
  join_date: string;
  profiles: { role: string } | { role: string }[] | null;
};

function getRole(p: Player) {
  if (Array.isArray(p.profiles)) return p.profiles[0]?.role ?? "player";
  return p.profiles?.role ?? "player";
}

export default function UsersTable({
  players,
  isAdmin,
}: {
  players: Player[];
  isAdmin: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateRole(profileId: string, role: string) {
    setUpdatingId(profileId);
    await supabase.from("profiles").update({ role }).eq("id", profileId);
    setUpdatingId(null);
    router.refresh();
  }

  async function updateStatus(playerId: string, status: string) {
    setUpdatingId(playerId);
    await supabase
      .from("player_details")
      .update({ membership_status: status })
      .eq("id", playerId);
    setUpdatingId(null);
    router.refresh();
  }

  async function handleDelete(playerId: string) {
    const result = await deleteUserAccount(playerId);
    if (!result.ok) {
      throw new Error(result.error);
    }
    router.refresh();
  }

  return (
    <div className="card mt-6 overflow-x-auto min-w-0">
      <table className="min-w-full w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
            {isAdmin && <th className="px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const role = getRole(p);
            const busy = updatingId === p.id || updatingId === p.profile_id;

            return (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{p.efootball_username}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gold">
                    {role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      p.membership_status === "active"
                        ? "bg-indigo/20 text-indigo-light"
                        : "bg-red-500/15 text-gold"
                    }`}
                  >
                    {p.membership_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(p.join_date).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <select
                        disabled={busy}
                        value={role}
                        onChange={(e) => updateRole(p.profile_id, e.target.value)}
                        className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs outline-none disabled:opacity-50"
                      >
                        <option value="player">Player</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        disabled={busy}
                        onClick={() =>
                          updateStatus(
                            p.id,
                            p.membership_status === "active" ? "suspended" : "active"
                          )
                        }
                        className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-surface-2 disabled:opacity-50"
                      >
                        {p.membership_status === "active" ? "Suspend" : "Reactivate"}
                      </button>

                      <ConfirmActionButton
                        onConfirm={() => handleDelete(p.id)}
                        confirmTitle="Delete user permanently?"
                        confirmMessage={`This will permanently delete ${p.efootball_username}'s account, profile, stats, and auth login. Match history may be updated to remove their player links. This cannot be undone.`}
                        confirmText="Yes, delete user"
                        cancelText="Cancel"
                        successMessage="User deleted permanently."
                        errorMessage="Failed to delete user."
                        isDangerous
                        buttonClassName="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        Delete
                      </ConfirmActionButton>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
