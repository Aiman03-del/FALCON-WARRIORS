"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmableDeleteButton from "@/app/components/ConfirmableDeleteButton";

export default function DeleteTournamentButton({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted?: (id: string) => void;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);

    if (error) {
      throw error;
    }

    onDeleted?.(id);
    router.refresh();
  }

  return (
    <ConfirmableDeleteButton onDelete={handleDelete} label="this tournament">
      <Trash2 size={16} />
    </ConfirmableDeleteButton>
  );
}
