"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import ConfirmableDeleteButton from "@/app/components/ConfirmableDeleteButton";

export default function DeleteTournamentButton({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    await supabase.from("tournaments").delete().eq("id", id);
    router.refresh();
  }

  return (
    <ConfirmableDeleteButton onDelete={handleDelete} label="this tournament">
      <Trash2 size={16} />
    </ConfirmableDeleteButton>
  );
}
