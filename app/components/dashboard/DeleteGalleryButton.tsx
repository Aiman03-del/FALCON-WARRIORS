"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

export default function DeleteGalleryButton({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this photo?")) return;
    setLoading(true);
    await supabase.from("gallery").delete().eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      <Trash2 size={14} />
    </button>
  );
}