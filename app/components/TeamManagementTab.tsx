"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X, Crown } from "lucide-react";
import { sendTeamInvite, cancelTeamInvite } from "@/app/lib/actions/teamInvites";
import { setLineupPosition, updateTeamProfile } from "@/app/lib/actions/tournamentTeams";
import ImageUploadInput from "@/app/components/ImageUploadInput";
import SelectField from "@/app/components/SelectField";
import FillButton from "@/app/components/FillButton";
import { useToast } from "@/app/providers/ToastProvider";

type Member = {
  id: string;
  player_id: string;
  role: "captain" | "member";
  position: number | null;
  player?: { efootball_username: string; real_name: string | null } | null;
};
type RecruitablePlayer = { id: string; efootball_username: string; real_name: string | null };
type SentInvite = { id: string; player_id: string; status: string; player?: { efootball_username: string } | null };

type Props = {
  tournamentId: string;
  teamId: string;
  teamSize: number;
  teamName: string;
  teamLogoUrl: string | null;
  members: Member[];
  recruitablePlayers: RecruitablePlayer[];
  sentInvites: SentInvite[];
  isLocked: boolean;
};

export default function TeamManagementTab({
  tournamentId,
  teamId,
  teamSize,
  teamName,
  teamLogoUrl,
  members,
  recruitablePlayers,
  sentInvites,
  isLocked,
}: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nameInput, setNameInput] = useState(teamName);
  const [logoInput, setLogoInput] = useState(teamLogoUrl ?? "");
  const [selectedRecruitId, setSelectedRecruitId] = useState("");

  const canInvite = !isLocked && members.length < teamSize && !!teamName && !!teamLogoUrl;
  const pendingSent = sentInvites.filter((i) => i.status === "pending");

  const recruitOptions = recruitablePlayers
    .filter((p) => !pendingSent.some((i) => i.player_id === p.id))
    .map((p) => ({ value: p.id, label: p.real_name?.trim() || p.efootball_username }));

  async function handleSaveProfile() {
    if (!nameInput.trim() || !logoInput) {
      addToast("Team name and logo are both required.", "error");
      return;
    }
    setLoading(true);
    const res = await updateTeamProfile(tournamentId, teamId, nameInput.trim(), logoInput);
    setLoading(false);
    if (!res.ok) return addToast(res.error, "error");
    addToast("Team profile saved.", "success");
    router.refresh();
  }

  async function handleInvite() {
    if (!selectedRecruitId) return;
    setLoading(true);
    const res = await sendTeamInvite(tournamentId, teamId, selectedRecruitId);
    setLoading(false);
    if (!res.ok) return addToast(res.error, "error");
    addToast("Invite sent.", "success");
    setSelectedRecruitId("");
    router.refresh();
  }

  async function handleCancel(inviteId: string) {
    setLoading(true);
    const res = await cancelTeamInvite(inviteId);
    setLoading(false);
    if (!res.ok) return addToast(res.error, "error");
    addToast("Invite cancelled.", "success");
    router.refresh();
  }

  async function handleReorder(memberId: string, newPosition: string) {
    const res = await setLineupPosition(memberId, Number(newPosition));
    if (!res.ok) return addToast(res.error, "error");
    router.refresh();
  }

  return (
    <div>
      {isLocked && (
        <p className="mb-4 rounded-lg bg-white/10 p-3 text-xs text-muted">
          টুর্নামেন্ট লকড — টিমে আর কোনো পরিবর্তন করা যাবে না।
        </p>
      )}

      <div className="mb-6">
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
          Team Profile
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ImageUploadInput
            folder="/falcon-warriors/team-logos"
            value={logoInput}
            onUploaded={setLogoInput}
            label="Team Logo"
          />
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted">
              Team Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. Falcon Strikers"
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80 disabled:opacity-50"
            />
            {!isLocked && (
              <FillButton onClick={handleSaveProfile} disabled={loading} className="mt-3">
                Save Team Profile
              </FillButton>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
          Roster ({members.length}/{teamSize})
        </p>
        <div className="flex flex-col gap-2">
          {members
            .slice()
            .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
            .map((m, idx) => (
              <div key={m.id} className="card flex items-center justify-between gap-3 p-3">
                <span className="flex items-center gap-2 text-sm">
                  {m.role === "captain" && <Crown size={12} className="text-gold" />}
                  {m.player?.real_name?.trim() || m.player?.efootball_username}
                </span>
                {!isLocked && (
                  <SelectField
                    value={(m.position ?? idx + 1).toString()}
                    onChange={(v) => handleReorder(m.id, v)}
                    options={Array.from({ length: teamSize }).map((_, i) => ({
                      value: (i + 1).toString(),
                      label: `Position ${i + 1}`,
                    }))}
                    className="w-40"
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      {pendingSent.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
            Pending Invites Sent
          </p>
          <div className="flex flex-col gap-2">
            {pendingSent.map((inv) => (
              <div key={inv.id} className="card flex items-center justify-between gap-2 p-3">
                <span className="text-sm">{inv.player?.efootball_username}</span>
                <button onClick={() => handleCancel(inv.id)} disabled={loading}>
                  <X size={14} className="text-muted hover:text-gold" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!canInvite && !isLocked && (
        <p className="mb-4 rounded-lg bg-gold/10 p-3 text-xs text-gold">
          রিকোয়েস্ট পাঠানোর আগে টিমের নাম আর লোগো সেভ করুন।
        </p>
      )}

      {canInvite && (
        <div>
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-gold">
            Recruit a Player
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <SelectField
                label="Search players"
                value={selectedRecruitId}
                onChange={setSelectedRecruitId}
                options={recruitOptions}
                placeholder="Search and select a player"
                searchable
                clearable
              />
            </div>
            <FillButton onClick={handleInvite} disabled={loading || !selectedRecruitId}>
              <Send size={14} className="mr-1 inline" />
              Send Invite
            </FillButton>
          </div>
          {recruitOptions.length === 0 && (
            <p className="mt-2 text-xs text-muted">No recruitable players found right now.</p>
          )}
        </div>
      )}
    </div>
  );
}
