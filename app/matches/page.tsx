import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import MatchResultRow from "@/app/components/MatchResultRow";
import MatchesFilterBar from "@/app/components/MatchesFilterBar";
import { Swords, Calendar, CheckCircle2, Clock } from "lucide-react";
import { getMatches } from "@/app/lib/queries/matches";

export const metadata = {
  title: "Matches | Falcon Warriors",
  description: "All match results, upcoming fixtures and live games for Falcon Warriors eFootball club.",
};

const resultStyles = {
  WIN: "bg-indigo/20 text-indigo-light border-indigo/40",
  DRAW: "bg-white/10 text-muted border-white/20",
  LOSS: "bg-gold/15 text-gold border-gold/30",
};

function getResult(home: number, away: number): "WIN" | "DRAW" | "LOSS" {
  if (home > away) return "WIN";
  if (home === away) return "DRAW";
  return "LOSS";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; type?: string }>;
}) {
  const params = await searchParams;
  const matches = await getMatches({
    status: params.status,
    search: params.search,
    type: params.type as any,
  });

  const all = matches ?? [];
  const upcoming = all.filter((m) => m.status === "upcoming" || m.status === "live");
  const completed = all.filter((m) => m.status === "completed");

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="section-divider" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
          Matches
        </h1>
        <p className="mt-2 text-sm text-muted">
          {completed.length} results · {upcoming.length} upcoming fixtures
        </p>

        {/* Filter Bar */}
        <div className="mt-6">
          <MatchesFilterBar />
        </div>

        {/* Upcoming / Live */}
        {upcoming.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-gold">
              <Clock size={14} />
              Upcoming Fixtures
            </h2>
            <div className="flex flex-col gap-3">
              {upcoming.map((m) => {
                const isLive = m.status === "live";
                return (
                  <Link key={m.id} href={`/matches/${m.id}`} className="card block p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-2 py-1.5">
                          <span className="font-display text-base font-bold leading-none">
                            {new Date(m.match_date).toLocaleDateString("en-US", { day: "2-digit" })}
                          </span>
                          <span className="text-[9px] uppercase text-muted">
                            {new Date(m.match_date).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">vs {m.opponent_name}</p>
                          <p className="text-xs text-muted">{m.competition ?? "Friendly"}</p>
                        </div>
                      </div>
                      {isLive ? (
                        <span className="inline-flex w-fit animate-pulse items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
                          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                          LIVE NOW
                        </span>
                      ) : (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs text-muted">
                          <Calendar size={11} />
                          {formatDate(m.match_date)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-gold">
            <CheckCircle2 size={14} />
            Results
          </h2>

          {completed.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-12 text-center">
              <Swords size={32} className="text-muted/40" />
              <p className="text-sm text-muted">No completed matches yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {completed.map((m) => {
                const home = m.score_home ?? 0;
                const away = m.score_away ?? 0;
                const result = getResult(home, away);

                return (
                  <MatchResultRow
                    key={m.id}
                    id={m.id}
                    date={m.match_date}
                    competition={m.competition}
                    scoreHome={home}
                    scoreAway={away}
                    opponentName={m.opponent_name ?? "Opponent"}
                    opponentTag={m.opponent_tag}
                    opponentLogoUrl={m.opponent_logo_url}
                    matchType={m.match_type}
                    tournamentId={m.tournament_id}
                    result={result}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
