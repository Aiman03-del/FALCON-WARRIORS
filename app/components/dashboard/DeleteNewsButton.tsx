"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
export default function DeleteNewsButton({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this news post? This cannot be undone.")) return;

    setLoading(true);
    await supabase.from("news").delete().eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg p-2 text-gold transition hover:bg-gold/15 hover:text-red-300 disabled:opacity-50"
      aria-label="Delete news post"
    >
      <Trash2 size={16} />
    </button>
  );
}