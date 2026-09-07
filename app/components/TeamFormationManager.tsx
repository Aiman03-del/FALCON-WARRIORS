"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, LogOut, Crown } from "lucide-react";
import { createTeam, joinTeam, leaveTeam } from "@/app/lib/actions/tournamentTeams";

type Member = { player_id: string; role: "captain" | "member"; player?: { efootball_username: string; real_name: string | null } | null };
type Team = { id: string; name: string; status: "pending" | "approved" | "rejected"; members: Member[] };

type Props = { tournamentId: string; teamSize: number; teams: Team[]; myPlayerId: string | null; isApprovedParticipant: boolean };

export default function TeamFormationManager({ tournamentId, teamSize, teams, myPlayerId, isApprovedParticipant }: Props) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const myTeam = teams.find((team) => team.members.some((member) => member.player_id === myPlayerId));
  const openTeams = teams.filter((team) => team.members.length < teamSize && team.id !== myTeam?.id);
  if (!isApprovedParticipant) return null;

  async function handleCreate() {
    if (!teamName.trim()) return;
    setLoading(true); setError(null);
    const res = await createTeam(tournamentId, teamName.trim());
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setTeamName(""); router.refresh();
  }
  async function handleJoin(teamId: string) {
    setLoading(true); setError(null);
    const res = await joinTeam(tournamentId, teamId, teamSize);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }
  async function handleLeave() {
    if (!myTeam) return;
    setLoading(true); setError(null);
    const res = await leaveTeam(tournamentId, myTeam.id);
    setLoading(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2"><Users size={16} className="text-gold" /><h3 className="font-display text-sm font-bold uppercase tracking-wide text-gold">Teams ({teamSize} per team)</h3></div>
      {error && <p className="mb-3 text-xs text-gold">{error}</p>}
      {myTeam ? (
        <div className="card mb-6 p-4">
          <div className="mb-2 flex items-center justify-between"><p className="font-semibold">{myTeam.name}</p><span className="rounded-full bg-indigo/20 px-2 py-1 text-xs font-semibold text-indigo-light">{myTeam.status === "approved" ? "Approved" : "Pending"}</span></div>
          <div className="flex flex-col gap-1">{myTeam.members.map((member) => <div key={member.player_id} className="flex items-center gap-2 text-sm text-muted">{member.role === "captain" && <Crown size={12} className="text-gold" />}{member.player?.real_name?.trim() || member.player?.efootball_username || "Player"}</div>)}{Array.from({ length: Math.max(0, teamSize - myTeam.members.length) }).map((_, index) => <div key={`empty-${index}`} className="text-sm text-muted/50">Open slot</div>)}</div>
          <button onClick={handleLeave} disabled={loading} className="btn-outline-sm mt-3 flex items-center gap-1"><LogOut size={14} />Leave Team</button>
        </div>
      ) : (
        <>
          <div className="card mb-4 flex flex-col gap-2 p-4"><p className="text-xs font-semibold uppercase text-muted">Create Your Own Team</p><div className="flex gap-2"><input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" className="input flex-1" /><button onClick={handleCreate} disabled={loading || !teamName.trim()} className="btn-primary-sm"><Plus size={14} />Create</button></div></div>
          {openTeams.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase text-muted">Or Join an Open Team</p><div className="flex flex-col gap-2">{openTeams.map((team) => <div key={team.id} className="card flex items-center justify-between gap-3 p-3"><div><p className="font-semibold">{team.name}</p><p className="text-xs text-muted">{team.members.length}/{teamSize} joined</p></div><button onClick={() => handleJoin(team.id)} disabled={loading} className="btn-primary-sm">Join</button></div>)}</div></div>}
        </>
      )}
    </div>
  );
}
