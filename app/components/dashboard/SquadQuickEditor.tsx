"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

type PlayerOption = { id: string; efootball_username: string };

export default function SquadQuickEditor({
  tournamentId,
  allPlayers,
  currentSquad,
}: {
  tournamentId: string;
  allPlayers: PlayerOption[];
  currentSquad: PlayerOption[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>(currentSquad.map((p) => p.id));
  const [loading, setLoading] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleSave() {
    setLoading(true);
    await supabase.from("tournament_squad").delete().eq("tournament_id", tournamentId);
    if (selected.length > 0) {
      await supabase
        .from("tournament_squad")
        .insert(selected.map((playerId) => ({ tournament_id: tournamentId, player_id: playerId })));
    }
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
            Squad ({currentSquad.length})
          </h2>
          <button
            onClick={() => {
              setSelected(currentSquad.map((p) => p.id));
              setEditing(true);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-gold hover:text-gold-light"
          >
            <Pencil size={13} />
            Edit Squad
          </button>
        </div>

        {currentSquad.length === 0 ? (
          <p className="text-sm text-muted">No squad selected yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentSquad.map((p) => (
              <span
                key={p.id}
                className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium"
              >
                {p.efootball_username}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-gold">
          Edit Squad ({selected.length} selected)
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-indigo/20 px-3 py-1.5 text-xs font-semibold text-indigo-light hover:bg-indigo/30 disabled:opacity-50"
          >
            <Check size={13} />
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-muted hover:bg-white/15"
          >
            <X size={13} />
            Cancel
          </button>
        </div>
      </div>

      <div className="card grid grid-cols-2 gap-1 p-3 sm:grid-cols-3 md:grid-cols-4">
        {allPlayers.map((p) => (
          <label
            key={p.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
          >
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={() => toggle(p.id)}
              className="h-4 w-4 rounded border-border accent-gold"
            />
            <span className="truncate">{p.efootball_username}</span>
          </label>
        ))}
      </div>
    </div>
  );
}