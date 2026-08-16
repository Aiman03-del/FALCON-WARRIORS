"use client";

import { useEffect, useState } from "react";
import MatchCard from "@/app/components/dashboard/MatchCard";
import { createClient } from "@/app/lib/supabase/client";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";

type MatchItem = {
  id: string;
  slug: string | null;
  kind: "official" | "internal";
  opponent_name: string;
  opponent_logo_url: string | null;
  competition: string | null;
  match_date: string;
  status: string;
  score_home: number | null;
  score_away: number | null;
};

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<"official" | "unofficial">("official");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [logoUrl, setLogoUrl] = useState("/logo.jpg");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMatches = async () => {
      setFetchError(null);
      const supabase = await createClient();

      const { data: officialMatches, error: err1 } = await supabase
        .from("matches")
        .select(
          "id, slug, opponent_name, opponent_logo_url, competition, round_stage, match_date, status, score_home, score_away, tournament_id, tournaments!inner(type)"
        )
        .not("tournament_id", "is", null)
        .eq("tournaments.type", "official")
        .order("match_date", { ascending: false });

      const { data: internalMatches, error: err2 } = await supabase
        .from("tournament_matches")
        .select(
          "id, round, status, player1_score, player2_score, created_at, tournament_id, tournaments!inner(type, name), player1:player1_id(efootball_username), player2:player2_id(efootball_username)"
        )
        .eq("tournaments.type", "internal")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (err1 || err2) {
        setFetchError(err1?.message ?? err2?.message ?? "Something went wrong");
        setLoading(false);
        return;
      }

      const normalizedOfficial = (officialMatches ?? []).map((m: any) => ({
        id: m.id,
        slug: m.slug,
        kind: "official" as const,
        opponent_name: m.opponent_name?.trim() ? m.opponent_name : "TBD Opponent",
        opponent_logo_url: m.opponent_logo_url,
        competition: m.competition ?? m.round_stage,
        match_date: m.match_date,
        status: m.status,
        score_home: m.score_home,
        score_away: m.score_away,
      }));

      const normalizedInternal = (internalMatches ?? []).map((m: any) => {
        const p1 = Array.isArray(m.player1) ? m.player1[0] : m.player1;
        const p2 = Array.isArray(m.player2) ? m.player2[0] : m.player2;
        const tournamentName = Array.isArray(m.tournaments) ? m.tournaments[0]?.name : m.tournaments?.name;
        return {
          id: m.id,
          slug: null,
          kind: "internal" as const,
          opponent_name: `${p1?.efootball_username ?? "?"} vs ${p2?.efootball_username ?? "?"}`,
          opponent_logo_url: null,
          competition: tournamentName ?? `Round ${m.round}`,
          match_date: m.created_at,
          status: m.status,
          score_home: m.player1_score,
          score_away: m.player2_score,
        };
      });

      setMatches([...normalizedOfficial, ...normalizedInternal] as MatchItem[]);
      setLoading(false);
    };

    void loadMatches();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    getSiteSettings().then((s) => setLogoUrl(s.logoUrl));
  }, []);

  const filteredMatches = (matches ?? []).filter((m) =>
    activeTab === "official" ? m.kind === "official" : m.kind === "internal"
  );

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

      {fetchError && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load matches: {fetchError}
        </p>
      )}

      {loading && (
        <p className="mt-4 text-sm text-muted">Loading matches...</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMatches.map((m) => (
          <MatchCard
            key={m.id}
            id={m.id}
            slug={m.slug}
            logoUrl={logoUrl}
            opponentName={m.opponent_name}
            opponentLogoUrl={m.opponent_logo_url}
            competition={m.competition}
            matchDate={m.match_date}
            status={m.status}
            scoreHome={m.score_home}
            scoreAway={m.score_away}
          />
        ))}
        {!loading && filteredMatches.length === 0 && (
          <div className="col-span-full rounded-lg border border-border bg-surface-2 px-6 py-12 text-center">
            <p className="text-sm text-muted">No {activeTab} matches yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
