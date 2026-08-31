"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

type PendingPlayer = {
  id: string;
  slug: string;
  efootball_username: string;
  real_name: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  platform: string | null;
  join_date: string;
};

export default function PendingUsersTable({
  players,
  onRefresh,
}: {
  players: PendingPlayer[];
  onRefresh: () => void | Promise<void>;
}) {
  const supabase = createClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function setStatus(playerId: string, status: "active" | "rejected") {
    setUpdatingId(playerId);
    await supabase.from("player_details").update({ membership_status: status }).eq("id", playerId);
    setUpdatingId(null);
    await onRefresh();
  }

  if (players.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No pending registrations right now.
      </div>
    );
  }

  return (
    <div className="card mt-6 overflow-x-auto">
      <table className="min-w-full w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Platform</th>
            <th className="px-4 py-3">Applied</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const busy = updatingId === p.id;
            const displayName = p.real_name?.trim() || p.efootball_username;

            return (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/dashboard/users/${p.slug}`} className="flex items-center gap-2.5 hover:underline">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-2">
                      {p.avatar_url ? (
                        <Image src={p.avatar_url} alt={displayName} fill sizes="32px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-muted">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>{displayName}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {[p.city, p.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-muted">{p.platform ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{new Date(p.join_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      disabled={busy}
                      onClick={() => setStatus(p.id, "active")}
                      className="flex items-center gap-1 rounded-lg border border-gold/50 bg-gold/10 px-2.5 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 disabled:opacity-50"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => setStatus(p.id, "rejected")}
                      className="flex items-center gap-1 rounded-lg border border-red-500/40 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
