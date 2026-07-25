"use client";

import { useEffect, useState } from "react";
import DeleteMatchButton from "@/app/components/dashboard/DeleteMatchButton";
import Link from "next/link";
import { Edit3 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

const statusStyles: Record<string, string> = {
  upcoming: "bg-white/10 text-muted",
  live: "bg-red-500/15 text-red-400",
  completed: "bg-indigo/20 text-indigo-light",
};

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

      <div className="card mt-6 overflow-x-auto min-w-0">
        <table className="min-w-full w-full text-left text-sm">
          <thead className="hidden border-b border-border text-xs uppercase text-muted md:table-header-group">
            <tr className="md:table-row">
              <th className="hidden px-4 py-3 md:table-cell">Opponent</th>
              <th className="hidden px-4 py-3 md:table-cell">Competition</th>
              <th className="hidden px-4 py-3 md:table-cell">Date</th>
              <th className="hidden px-4 py-3 md:table-cell">Score</th>
              <th className="hidden px-4 py-3 md:table-cell">Status</th>
              <th className="hidden px-4 py-3 md:table-cell"></th>
            </tr>
          </thead>
          <tbody className="md:table-row-group">
            {filteredMatches.map((m) => (
              <tr key={m.id} className="block border-b border-border last:border-0 md:table-row">
                <td className="block px-4 py-3 md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Opponent
                  </span>
                  <Link
                    href={`/dashboard/matches/${m.id}`}
                    className="text-gold transition hover:text-gold-light"
                  >
                    {m.opponent_name}
                  </Link>
                </td>
                <td className="block px-4 py-3 text-muted md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Competition
                  </span>
                  {m.competition ?? "—"}
                </td>
                <td className="block px-4 py-3 text-muted md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Date
                  </span>
                  {new Date(m.match_date).toLocaleDateString()}
                </td>
                <td className="block px-4 py-3 md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Score
                  </span>
                  {m.score_home !== null ? `${m.score_home} - ${m.score_away}` : "—"}
                </td>
                <td className="block px-4 py-3 md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Status
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyles[m.status]}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="block px-4 py-3 text-right md:table-cell">
                  <span className="mb-2 block text-[10px] uppercase tracking-wide text-muted md:hidden">
                    Actions
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-2 md:justify-end">
                    <Link
                      href={`/dashboard/matches/${m.id}`}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-gold transition hover:bg-gold/10 hover:text-gold-light"
                      aria-label="View match"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <DeleteMatchButton id={m.id} />
                  </div>
                </td>
              </tr>
            ))}
            {filteredMatches.length === 0 && (
              <tr className="block md:table-row">
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No {activeTab} matches yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
