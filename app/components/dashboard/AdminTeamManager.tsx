"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, UserMinus, CheckCircle2, XCircle } from "lucide-react";
import { setTeamStatus, adminAssignPlayerToTeam, randomGenerateTeams } from "@/app/lib/actions/tournamentTeams";

type Member = { player_id: string; role: "captain" | "member"; player?: { efootball_username: string; real_name: string | null } | null };
type Team = { id: string; name: string; status: "pending" | "approved" | "rejected"; members: Member[] };
type Participant = { player_id: string; player?: { efootball_username: string; real_name: string | null } | null };
type Props = { tournamentId: string; teamSize: number; teams: Team[]; approvedParticipants: Participant[] };

export default function AdminTeamManager({ tournamentId, teamSize, teams, approvedParticipants }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assignedIds = new Set(teams.flatMap((team) => team.members.map((member) => member.player_id)));
  const unassigned = approvedParticipants.filter((participant) => !assignedIds.has(participant.player_id));

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setLoading(true); setError(null); const res = await action(); setLoading(false);
    if (!res.ok) return setError(res.error ?? "Action failed");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-sm font-bold uppercase tracking-wide text-gold">Team Management ({teamSize} per team)</h3><button onClick={() => run(() => randomGenerateTeams(tournamentId, teamSize))} disabled={loading} className="btn-primary-sm flex items-center gap-1"><Shuffle size={14} />Randomly Generate Teams</button></div>
      {error && <p className="mb-3 text-xs text-gold">{error}</p>}
      <div className="mb-6 flex flex-col gap-3">{teams.map((team) => <div key={team.id} className="card p-3"><div className="mb-2 flex items-center justify-between"><p className="font-semibold">{team.name} ({team.members.length}/{teamSize})</p><div className="flex items-center gap-2"><span className="rounded-full bg-white/10 px-2 py-1 text-xs">{team.status}</span>{team.status !== "approved" && <button onClick={() => run(() => setTeamStatus(team.id, "approved"))} title="Approve"><CheckCircle2 size={16} className="text-indigo-light" /></button>}{team.status !== "rejected" && <button onClick={() => run(() => setTeamStatus(team.id, "rejected"))} title="Reject"><XCircle size={16} className="text-gold" /></button>}</div></div><div className="flex flex-col gap-1">{team.members.map((member) => <div key={member.player_id} className="flex items-center justify-between text-sm"><span>{member.role === "captain" ? "👑 " : ""}{member.player?.real_name?.trim() || member.player?.efootball_username}</span><button onClick={() => run(() => adminAssignPlayerToTeam(tournamentId, member.player_id, null))} title="Remove from team"><UserMinus size={14} className="text-muted hover:text-gold" /></button></div>)}</div></div>)}</div>
      {unassigned.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase text-muted">Unassigned Approved Players ({unassigned.length})</p><div className="flex flex-col gap-2">{unassigned.map((participant) => <div key={participant.player_id} className="card flex items-center justify-between gap-3 p-3"><p className="text-sm">{participant.player?.real_name?.trim() || participant.player?.efootball_username}</p><select className="input text-sm" defaultValue="" onChange={(event) => event.target.value && run(() => adminAssignPlayerToTeam(tournamentId, participant.player_id, event.target.value))}><option value="" disabled>Assign to team...</option>{teams.filter((team) => team.members.length < teamSize).map((team) => <option key={team.id} value={team.id}>{team.name} ({team.members.length}/{teamSize})</option>)}</select></div>)}</div></div>}
    </div>
  );
}
