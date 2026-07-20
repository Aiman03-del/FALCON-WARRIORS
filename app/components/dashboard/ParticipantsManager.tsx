"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check, X } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client"; 

type PlayerOption = { id: string; efootball_username: string };

type Participant = {
  id: string;
  points: number;
  status: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  player_details: { efootball_username: string } | { efootball_username: string }[] | null;
};

function getUsername(p: Participant) {
  if (Array.isArray(p.player_details)) return p.player_details[0]?.efootball_username ?? "—";
  return p.player_details?.efootball_username ?? "—";
}

const statusStyles: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-indigo/20 text-indigo-light",
  rejected: "bg-red-500/15 text-red-400",
};

export default function ParticipantsManager({
  tournamentId,
  participants,
  allPlayers,
  maxParticipants,
}: {
  tournamentId: string;
  participants: Participant[];
  allPlayers: PlayerOption[];
  maxParticipants: number | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [loading, setLoading] = useState(false);

  const pending = participants.filter((p) => p.status === "pending");
  const approved = participants.filter((p) => p.status === "approved");

  async function handleDecision(participantId: string, status: "approved" | "rejected") {
    if (status === "approved" && maxParticipants && approved.length >= maxParticipants) {
      alert("Slots are already full. Reject some pending requests or increase max participants.");
      return;
    }
    setLoading(true);
    await supabase.from("tournament_participants").update({ status }).eq("id", participantId);
    setLoading(false);
    router.refresh();
  }

  async function handleAddDirect() {
    if (!selectedPlayer) return;
    setLoading(true);

    await supabase.from("tournament_participants").insert({
      tournament_id: tournamentId,
      player_id: selectedPlayer,
      points: 0,
      status: "approved",
    });

    setLoading(false);
    setSelectedPlayer("");
    router.refresh();
  }

  async function handleRemove(participantId: string) {
    if (!confirm("Remove this participant?")) return;
    await supabase.from("tournament_participants").delete().eq("id", participantId);
    router.refresh();
  }

  const registeredUsernames = participants.map((p) => getUsername(p));
  const availablePlayers = allPlayers.filter(
    (p) => !registeredUsernames.includes(p.efootball_username)
  );

  return (
    <div className="mt-6">
      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gold">
            Pending Requests ({pending.length})
          </h3>
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{getUsername(p)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDecision(p.id, "approved")}
                          disabled={loading}
                          className="flex items-center gap-1 rounded-lg bg-indigo/20 px-3 py-1.5 text-xs font-semibold text-indigo-light hover:bg-indigo/30 disabled:opacity-50"
                        >
                          <Check size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(p.id, "rejected")}
                          disabled={loading}
                          className="flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50"
                        >
                          <X size={13} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct Add (staff bypass) */}
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-muted">
            Add Participant Directly (auto-approved)
          </label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          >
            <option value="">— Select player —</option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.efootball_username}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddDirect}
          disabled={loading || !selectedPlayer}
          className="btn-primary text-sm disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Approved Participants / Points Table */}
      <h3 className="mb-3 mt-6 font-display text-sm font-bold uppercase tracking-wide text-gold">
        Approved Participants
        {maxParticipants ? ` (${approved.length}/${maxParticipants})` : ` (${approved.length})`}
      </h3>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center">W</th>
              <th className="px-2 py-3 text-center">D</th>
              <th className="px-2 py-3 text-center">L</th>
              <th className="px-2 py-3 text-center">GD</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {approved
              .slice()
              .sort((a, b) => b.points - a.points)
              .map((p, idx) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-display font-bold text-gold">#{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{getUsername(p)}</td>
                  <td className="px-2 py-3 text-center text-muted">{p.matches_played}</td>
                  <td className="px-2 py-3 text-center text-muted">{p.wins}</td>
                  <td className="px-2 py-3 text-center text-muted">{p.draws}</td>
                  <td className="px-2 py-3 text-center text-muted">{p.losses}</td>
                  <td className="px-2 py-3 text-center text-muted">
                    {p.goals_for - p.goals_against > 0 ? "+" : ""}
                    {p.goals_for - p.goals_against}
                  </td>
                  <td className="px-4 py-3 font-display font-bold text-gold">{p.points}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleRemove(p.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            {approved.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted">
                  No approved participants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}