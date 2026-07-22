"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

export default function BallonDorActions({ id, isWinner }: { id: string; isWinner: boolean }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSetWinner() {
    setLoading(true);

    // mark the rest of this year's nominees as non-winners first so only one winner remains
    const { data: current } = await supabase
      .from("ballon_dor_nominees")
      .select("year")
      .eq("id", id)
      .single();

    if (current) {
      await supabase
        .from("ballon_dor_nominees")
        .update({ is_winner: false })
        .eq("year", current.year);
    }

    await supabase.from("ballon_dor_nominees").update({ is_winner: true }).eq("id", id);

    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Remove this nominee?")) return;
    setLoading(true);
    await supabase.from("ballon_dor_nominees").delete().eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-3">
      {!isWinner && (
        <button
          onClick={handleSetWinner}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-light disabled:opacity-50"
        >
          <Star size={13} />
          Mark Winner
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-400 hover:text-red-300 disabled:opacity-50"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}