"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmableDeleteButton from "@/app/components/ConfirmableDeleteButton";

export default function DeleteGalleryButton({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    await supabase.from("gallery").delete().eq("id", id);
    router.refresh();
  }

  return (
    <ConfirmableDeleteButton onDelete={handleDelete} label="this photo">
      <Trash2 size={14} />
    </ConfirmableDeleteButton>
  );
}