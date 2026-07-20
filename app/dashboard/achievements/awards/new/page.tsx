"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

type PlayerOption = { id: string; efootball_username: string };

export default function NewAwardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [title, setTitle] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [season, setSeason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("player_details")
      .select("id, efootball_username")
      .order("efootball_username")
      .then(({ data }) => setPlayers(data ?? []));
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from("awards").insert({
      title,
      player_id: playerId || null,
      season: season || null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/dashboard/achievements");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        New Player Award
      </h1>
      <p className="mt-1 text-sm text-muted">e.g. Season MVP, Top Scorer, Golden Glove.</p>

      <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Award Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="Season MVP"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Player</label>
          <select
            required
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          >
            <option value="">— Select player —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.efootball_username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Season (optional)</label>
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="2024"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
          {loading ? "Saving..." : "Add Award"}
        </button>
      </form>
    </div>
  );
}