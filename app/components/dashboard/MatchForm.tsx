"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/providers/ToastProvider";
import { createClient } from "@/app/lib/supabase/client";

export default function MatchForm() {
  const supabase = createClient();
  const router = useRouter();
  const { addToast } = useToast();

  const [opponentName, setOpponentName] = useState("");
  const [opponentTag, setOpponentTag] = useState("");
  const [competition, setCompetition] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchType, setMatchType] = useState<"internal" | "external">("internal");
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [players, setPlayers] = useState<Array<{ id: string; efootball_username: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPlayers() {
      const { data, error } = await supabase
        .from("player_details")
        .select("id, efootball_username")
        .order("efootball_username");

      if (!error) {
        setPlayers(data ?? []);
      }
    }

    loadPlayers();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (matchType === "internal" && (!player1Id || !player2Id)) {
      setError("Please select both players for an internal match.");
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("matches").insert({
      opponent_name: opponentName,
      opponent_tag: opponentTag || null,
      competition: competition || null,
      match_date: matchDate,
      match_type: matchType,
      player1_id: matchType === "internal" ? player1Id : null,
      player2_id: matchType === "internal" ? player2Id : null,
      status: "upcoming",
      moderator_id: userData.user?.id ?? null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      addToast(insertError.message, "error");
      return;
    }

    addToast("Match created successfully.", "success");
    router.push("/dashboard/matches");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Match Type</label>
        <select
          value={matchType}
          onChange={(e) => setMatchType(e.target.value as "internal" | "external")}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
        >
          <option value="internal">Internal (Player vs Player)</option>
          <option value="external">External / Friendly</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Opponent Name</label>
        <input
          required
          value={opponentName}
          onChange={(e) => setOpponentName(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Titan Esports"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          Opponent Tag (optional, short)
        </label>
        <input
          value={opponentTag}
          onChange={(e) => setOpponentTag(e.target.value)}
          maxLength={6}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="TITAN"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Competition</label>
        <input
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Champions League · Group Stage"
        />
      </div>

      {matchType === "internal" && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Player 1</label>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            >
              <option value="">Select player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.efootball_username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Player 2</label>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            >
              <option value="">Select player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.efootball_username}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Date & Time</label>
        <input
          type="datetime-local"
          required
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-gold/15 px-3 py-2 text-sm text-gold">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
        {loading ? "Creating..." : "Create Fixture"}
      </button>
    </form>
  );
}