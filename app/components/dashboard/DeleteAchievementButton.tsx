"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
export default function DeleteAchievementButton({
  id,
  table,
}: {
  id: string;
  table: "achievements" | "awards";
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this entry?")) return;
    setLoading(true);
    await supabase.from(table).delete().eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-gold hover:text-red-300 disabled:opacity-50"
    >
      <Trash2 size={14} />
    </button>
  );
}