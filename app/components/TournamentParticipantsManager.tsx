"use client";

import { Users, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Participant = {
  id: string;
  playerId: string;
  status: "pending" | "approved" | "rejected";
  player?: { efootball_username: string; real_name?: string | null };
};

type Props = {
  participants: Participant[];
  isAdmin?: boolean;
  tournamentType: "internal" | "external";
};

export default function TournamentParticipantsManager({ 
  participants, 
  isAdmin = false,
  tournamentType = "internal"
}: Props) {
  const [localParticipants, setLocalParticipants] = useState(participants);

  // Filter by status
  const approved = localParticipants.filter((p) => p.status === "approved");
  const pending = localParticipants.filter((p) => p.status === "pending");
  const rejected = localParticipants.filter((p) => p.status === "rejected");

  async function handleApprove(id: string) {
    // API call would happen here
    setLocalParticipants(
      localParticipants.map((p) =>
        p.id === id ? { ...p, status: "approved" } : p
      )
    );
  }

  async function handleReject(id: string) {
    // API call would happen here
    setLocalParticipants(
      localParticipants.map((p) =>
        p.id === id ? { ...p, status: "rejected" } : p
      )
    );
  }

  async function handleRemove(id: string) {
    // API call would happen here
    setLocalParticipants(localParticipants.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Users size={16} className="text-gold" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
          Participants ({approved.length})
        </h3>
      </div>

      {/* Approved Participants */}
      {approved.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase text-muted">Registered</p>
          <div className="flex flex-col gap-2">
            {approved.map((p) => (
              <div key={p.id} className="card flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-semibold">
                    {p.player?.real_name?.trim() || p.player?.efootball_username || `Player ${p.playerId.slice(0, 4)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-indigo/20 px-2 py-1 text-xs font-semibold text-indigo-light">
                    Approved
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="ml-1 rounded p-1.5 hover:bg-white/10"
                      title="Remove participant"
                    >
                      <Trash2 size={14} className="text-gold" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Join Requests (Internal Only) */}
      {tournamentType === "internal" && pending.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase text-muted">Pending Requests</p>
          <div className="flex flex-col gap-2">
            {pending.map((p) => (
              <div key={p.id} className="card flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-semibold">
                    {p.player?.real_name?.trim() || p.player?.efootball_username || `Player ${p.playerId.slice(0, 4)}`}
                  </p>
                  <p className="text-xs text-muted">Awaiting approval</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="btn-primary-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      className="btn-outline-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && isAdmin && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase text-muted">Rejected</p>
          <div className="flex flex-col gap-2">
            {rejected.map((p) => (
              <div key={p.id} className="card flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-semibold">
                    {p.player?.real_name?.trim() || p.player?.efootball_username || `Player ${p.playerId.slice(0, 4)}`}
                  </p>
                  <p className="text-xs text-muted">Request rejected</p>
                </div>
                <button
                  onClick={() => handleRemove(p.id)}
                  className="rounded p-1.5 hover:bg-white/10"
                  title="Remove"
                >
                  <Trash2 size={14} className="text-gold" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved.length === 0 && (
        <div className="card flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-muted">
            {isAdmin ? "No participants yet. Add players to get started." : "No registered participants."}
          </p>
          {isAdmin && (
            <button className="btn-primary-sm mt-2">
              <Plus size={14} />
              Add Participant
            </button>
          )}
        </div>
      )}
    </div>
  );
}
