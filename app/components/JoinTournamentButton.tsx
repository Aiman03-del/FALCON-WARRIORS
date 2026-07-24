"use client";

import { useState } from "react";
import OutlineButton from "@/app/components/OutlineButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle, Lock } from "lucide-react";
import { createClient } from "../lib/supabase/client";

type Props = {
  tournamentId: string;
  loggedIn: boolean;
  hasPlayerProfile?: boolean;
  playerId?: string;
  myRequestStatus: string | null;
  approvedCount?: number;
  maxParticipants: number | null;
  registrationDeadline: string | null;
  tournamentStatus: string;
  tournamentType?: "internal" | "external";
};

export default function JoinTournamentButton({
  tournamentId,
  loggedIn,
  hasPlayerProfile,
  playerId,
  myRequestStatus,
  approvedCount,
  maxParticipants,
  registrationDeadline,
  tournamentStatus,
  tournamentType = "internal",
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadlinePassed =
    !!registrationDeadline && new Date(registrationDeadline).getTime() < Date.now();
  const slotsFull = !!maxParticipants && (approvedCount ?? 0) >= maxParticipants;
  const tournamentClosed = tournamentStatus === "completed";

  if (!loggedIn) {
    return (
      <OutlineButton href="/login" className="text-sm">
        Login to Join
      </OutlineButton>
    );
  }

  if (!hasPlayerProfile) {
    return null;
  }

  // External tournaments: no join requests allowed
  if (tournamentType === "external") {
    if (myRequestStatus === "approved") {
      return (
        <span className="flex items-center gap-2 rounded-lg bg-indigo/20 px-4 py-2.5 text-sm font-semibold text-indigo-light">
          <CheckCircle2 size={16} />
          Registered (Admin Only)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-muted">
        <Lock size={16} />
        Admin Managed Tournament
      </span>
    );
  }

  if (myRequestStatus === "approved") {
    return (
      <span className="flex items-center gap-2 rounded-lg bg-indigo/20 px-4 py-2.5 text-sm font-semibold text-indigo-light">
        <CheckCircle2 size={16} />
        You're Registered
      </span>
    );
  }

  if (myRequestStatus === "pending") {
    return (
      <span className="flex items-center gap-2 rounded-lg bg-gold/15 px-4 py-2.5 text-sm font-semibold text-gold">
        <Clock size={16} />
        Request Pending Approval
      </span>
    );
  }

  if (myRequestStatus === "rejected") {
    return (
      <span className="flex items-center gap-2 rounded-lg bg-gold/15 px-4 py-2.5 text-sm font-semibold text-gold">
        <XCircle size={16} />
        Request Rejected
      </span>
    );
  }

  if (tournamentClosed) {
    return (
      <span className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-muted">
        <Lock size={16} />
        Tournament Ended
      </span>
    );
  }

  if (deadlinePassed) {
    return (
      <span className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-muted">
        <Lock size={16} />
        Registration Closed
      </span>
    );
  }

  if (slotsFull) {
    return (
      <span className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-muted">
        <Lock size={16} />
        Slots Full
      </span>
    );
  }

  async function handleJoin() {
    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from("tournament_participants").insert({
      tournament_id: tournamentId,
      player_id: playerId,
      status: "pending",
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button onClick={handleJoin} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
        {loading ? "Sending Request..." : "Request to Join"}
      </button>
      {error && <p className="mt-2 text-xs text-gold">{error}</p>}
    </div>
  );
}
