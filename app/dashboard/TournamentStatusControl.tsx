"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function TournamentStatusControl({
  tournamentId,
  currentStatus,
}: {
  tournamentId: string;
  currentStatus: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string) {
    if (newStatus === "cancelled" && !confirm("Cancel this tournament? This cannot be undone easily.")) {
      return;
    }
    setStatus(newStatus);
    setLoading(true);
    await supabase.from("tournaments").update({ status: newStatus }).eq("id", tournamentId);
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold disabled:opacity-50"
    >
      <option value="upcoming">Upcoming</option>
      <option value="ongoing">Ongoing</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}