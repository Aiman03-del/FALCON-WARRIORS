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
      className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      <Trash2 size={13} />
      Delete
    </button>
  );
}