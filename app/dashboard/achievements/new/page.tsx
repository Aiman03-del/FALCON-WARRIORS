"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

export default function NewAchievementPage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [season, setSeason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from("achievements").insert({
      title,
      season: season || null,
      description: description || null,
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
        New Club Achievement
      </h1>
      <p className="mt-1 text-sm text-muted">e.g. league titles, cup wins, tournament placements.</p>

      <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="Pro League Champions"
          />
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

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Description (optional)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-y rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
          {loading ? "Saving..." : "Add Achievement"}
        </button>
      </form>
    </div>
  );
}