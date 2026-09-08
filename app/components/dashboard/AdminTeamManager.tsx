"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, UserMinus, CheckCircle2, XCircle, Lock, Unlock, Crown } from "lucide-react";
import {
  setTeamStatus,
  adminAssignPlayerToTeam,
  randomGenerateTeams,
  adminTransferCaptain,
  setTeamsLocked,
} from "@/app/lib/actions/tournamentTeams";

type Member = {
  id: string;
  player_id: string;
  role: "captain" | "member";
  player?: { efootball_username: string; real_name: string | null } | null;
};

type Team = { id: string; name: string; status: "pending" | "approved" | "rejected"; members: Member[] };
type Participant = { player_id: string; player?: { efootball_username: string; real_name: string | null } | null };

type Props = {
  tournamentId: string;
  teamSize: number;
  teams: Team[];
  approvedParticipants: Participant[];
  teamsLocked: boolean;
};

export default function AdminTeamManager({
  tournamentId,
  teamSize,
  teams,
  approvedParticipants,
  teamsLocked,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignedIds = new Set(teams.flatMap((t) => t.members.map((m) => m.player_id)));
  const unassigned = approvedParticipants.filter((p) => !assignedIds.has(p.player_id));

  async function handleRandomGenerate() {
    setLoading(true);
    setError(null);
    const res = await randomGenerateTeams(tournamentId, teamSize);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  async function handleMove(playerId: string, teamId: string | null) {
    setLoading(true);
    const res = await adminAssignPlayerToTeam(tournamentId, playerId, teamId);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  async function handleStatus(teamId: string, status: "approved" | "rejected") {
    setLoading(true);
    const res = await setTeamStatus(teamId, status);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  async function handleTransferCaptain(teamId: string, playerId: string) {
    setLoading(true);
    const res = await adminTransferCaptain(teamId, playerId);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  async function handleToggleLock() {
    setLoading(true);
    const res = await setTeamsLocked(tournamentId, !teamsLocked);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
          Team Management ({teamSize} per team)
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleLock}
            disabled={loading}
            className={teamsLocked ? "btn-danger-sm flex items-center gap-1" : "btn-outline-sm flex items-center gap-1"}
          >
            {teamsLocked ? <Unlock size={14} /> : <Lock size={14} />}
            {teamsLocked ? "Unlock Teams" : "Lock Teams"}
          </button>
          <button onClick={handleRandomGenerate} disabled={loading} className="btn-primary-sm flex items-center gap-1">
            <Shuffle size={14} />
            Randomly Generate Teams
          </button>
        </div>
      </div>

      {teamsLocked && (
        <p className="mb-4 rounded-lg bg-white/10 p-3 text-xs text-muted">
          Teams are locked — participants can no longer leave/join/invite. Manual admin changes still remain active.
        </p>
      )}

      {error && <p className="mb-3 text-xs text-gold">{error}</p>}

      <div className="mb-6 flex flex-col gap-3">
        {teams.map((team) => (
          <div key={team.id} className="card p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">
                {team.name} ({team.members.length}/{teamSize})
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{team.status}</span>
                {team.status !== "approved" && (
                  <button onClick={() => handleStatus(team.id, "approved")} title="Approve">
                    <CheckCircle2 size={16} className="text-indigo-light" />
                  </button>
                )}
                {team.status !== "rejected" && (
                  <button onClick={() => handleStatus(team.id, "rejected")} title="Reject">
                    <XCircle size={16} className="text-gold" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {team.members.map((m) => (
                <div key={m.player_id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    {m.role === "captain" && <Crown size={12} className="text-gold" />}
                    {m.player?.real_name?.trim() || m.player?.efootball_username}
                  </span>
                  <div className="flex items-center gap-2">
                    {m.role !== "captain" && (
                      <button
                        onClick={() => handleTransferCaptain(team.id, m.player_id)}
                        title="Make captain"
                        className="text-xs text-muted hover:text-gold"
                      >
                        Make Captain
                      </button>
                    )}
                    <button onClick={() => handleMove(m.player_id, null)} title="Remove from team">
                      <UserMinus size={14} className="text-muted hover:text-gold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {unassigned.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted">
            Unassigned Approved Players ({unassigned.length})
          </p>
          <div className="flex flex-col gap-2">
            {unassigned.map((p) => (
              <div key={p.player_id} className="card flex items-center justify-between gap-3 p-3">
                <p className="text-sm">{p.player?.real_name?.trim() || p.player?.efootball_username}</p>
                <select
                  className="input text-sm"
                  defaultValue=""
                  onChange={(e) => e.target.value && handleMove(p.player_id, e.target.value)}
                >
                  <option value="" disabled>
                    Assign to team...
                  </option>
                  {teams
                    .filter((t) => t.members.length < teamSize)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.members.length}/{teamSize})
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
