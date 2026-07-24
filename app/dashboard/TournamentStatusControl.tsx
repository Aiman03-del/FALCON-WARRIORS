"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SelectField from "@/app/components/SelectField";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { useToast } from "@/app/providers/ToastProvider";
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
  const { addToast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    const previousStatus = status;
    setStatus(newStatus);
    setLoading(true);

    try {
      await supabase.from("tournaments").update({ status: newStatus }).eq("id", tournamentId);
      addToast(`Tournament status updated to ${newStatus}.`, "success");
      router.refresh();
    } catch (error) {
      setStatus(previousStatus);
      const message = error instanceof Error ? error.message : "Unable to update tournament status. Please try again.";
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(newStatus: string) {
    if (newStatus === "cancelled") {
      setIsConfirmOpen(true);
      return;
    }

    void updateStatus(newStatus);
  }

  function handleCancelConfirm() {
    setIsConfirmOpen(false);
  }

  async function handleConfirmCancel() {
    setIsConfirmOpen(false);
    await updateStatus("cancelled");
  }

  return (
    <>
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Cancel Tournament"
        message="Cancel this tournament? This cannot be undone easily."
        confirmText="Yes, Cancel"
        cancelText="Keep Open"
        isDangerous
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelConfirm}
        isLoading={loading}
      />
    </>
  );
}