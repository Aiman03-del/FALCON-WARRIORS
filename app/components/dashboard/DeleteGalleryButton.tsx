"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ConfirmableDeleteButton from "@/app/components/ConfirmableDeleteButton";
import { createClient } from "@/app/lib/supabase/client";

export async function deleteGalleryImage(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("gallery").delete().eq("id", id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

export default function DeleteGalleryButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const result = await deleteGalleryImage(id);
    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <ConfirmableDeleteButton onDelete={handleDelete} label="this gallery photo">
      <Trash2 size={14} />
    </ConfirmableDeleteButton>
  );
}