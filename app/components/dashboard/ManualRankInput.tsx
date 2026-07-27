"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

// Lets staff set a manual_rank override for a participant — the last resort
// in the tiebreak chain (points → goal difference → head-to-head → this),
// used when a tie genuinely can't be broken by the data alone (e.g. two
// teams tied on everything and never played each other). Lower number = 
// higher final rank. Leave empty to clear the override.
export default function ManualRankInput({
  participantId,
  currentValue,
}: {
  participantId: string;
  currentValue: number | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [value, setValue] = useState(currentValue?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("tournament_participants")
      .update({ manual_rank: value === "" ? null : Number(value) })
      .eq("id", participantId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="—"
        className="w-14 rounded-md border border-border bg-surface-2 px-2 py-1 text-center text-xs outline-none focus:border-gold"
        title="Manual tiebreak override (lower = higher rank). Only applies if still tied after points, GD, and head-to-head."
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md border border-border px-2 py-1 text-[10px] uppercase text-muted hover:text-white disabled:opacity-50"
      >
        {saving ? "..." : "Set"}
      </button>
    </div>
  );
}