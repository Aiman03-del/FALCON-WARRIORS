"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SelectField from "@/app/components/SelectField";
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
    <SelectField
      value={status}
      onChange={handleChange}
      disabled={loading}
      options={[
        { value: "upcoming", label: "Upcoming" },
        { value: "ongoing", label: "Ongoing" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ]}
      className="min-w-[140px]"
    />
  );
}