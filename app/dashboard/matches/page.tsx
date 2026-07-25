"use client";

import { useEffect, useState } from "react";
import MatchCard from "@/app/components/dashboard/MatchCard";
import { createClient } from "@/app/lib/supabase/client";

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<"official" | "unofficial">("official");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      const supabase = await createClient();

      // Fetch matches with their tournament info
      const { data: matchesData } = await supabase
        .from("matches")
        .select(
          "id, opponent_name, opponent_logo_url, competition, match_date, status, score_home, score_away, match_type, tournament_id, tournaments(type)"
        )
        .not("tournament_id", "is", null)
        .order("match_date", { ascending: false });

      setMatches(matchesData ?? []);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMatches = (matches ?? []).filter((m) => {
    const tournamentType = m.tournaments?.type || "internal";
    return activeTab === "official" ? tournamentType === "official" : tournamentType === "internal";
  });

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Matches
          </h1>
          <p className="mt-1 text-sm text-muted">View all tournament matches.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("official")}
          className={`px-4 py-3 font-medium text-sm transition ${
            activeTab === "official"
              ? "border-b-2 border-gold text-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          Official
        </button>
        <button
          onClick={() => setActiveTab("unofficial")}
          className={`px-4 py-3 font-medium text-sm transition ${
            activeTab === "unofficial"
              ? "border-b-2 border-gold text-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          Unofficial
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMatches.map((m) => (
          <MatchCard
            key={m.id}
            id={m.id}
            opponentName={m.opponent_name}
            opponentLogoUrl={m.opponent_logo_url}
            competition={m.competition}
            matchDate={m.match_date}
            status={m.status}
            scoreHome={m.score_home}
            scoreAway={m.score_away}
          />
        ))}
        {filteredMatches.length === 0 && (
          <div className="col-span-full rounded-lg border border-border bg-surface-2 px-6 py-12 text-center">
            <p className="text-sm text-muted">No {activeTab} matches yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
