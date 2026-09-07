import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import MatchResultRow from "@/app/components/MatchResultRow";
import { Swords, Calendar, CheckCircle2, Clock } from "lucide-react";
import { getUnifiedMatches } from "@/app/lib/queries/unifiedMatches";

export const metadata: Metadata = {
  title: "Matches | Falcon Warriors - Results & Fixtures",
  description: "View all Falcon Warriors match results, upcoming fixtures, and live games. Filter by type and status.",
  openGraph: {
    title: "Matches | Falcon Warriors",
    description: "View all Falcon Warriors match results and upcoming fixtures.",
  },
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
  const currentType = params.type === "unofficial" ? "unofficial" : "official";

  const all = await getUnifiedMatches({ status: params.status });

  let filtered = all.filter((m) =>
    currentType === "official" ? m.matchType === "official" : m.matchType === "internal"
  );

  if (params.search) {
    const q = params.search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (m) =>
          m.opponentName.toLowerCase().includes(q) ||
          (m.competition ?? "").toLowerCase().includes(q)
      );
    }
  }

  const upcoming = filtered.filter((m) => m.status === "upcoming" || m.status === "live");
  const completed = filtered.filter((m) => m.status === "completed");

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

        {/* Tabs */}
        <div className="mt-6 flex gap-1">
          {[
            { value: "official", label: "Official" },
            { value: "unofficial", label: "Unofficial" },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={`/matches?type=${tab.value}`}
              style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wide transition ${
                currentType === tab.value
                  ? "bg-gold text-bg"
                  : "bg-white/6 text-muted hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Upcoming / Live */}
        {upcoming.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold">
                <Clock size={14} />
              </span>
              <h2 className="font-display text-base font-bold uppercase tracking-wide text-white">
                Upcoming Fixtures
              </h2>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="flex flex-col gap-3">
              {upcoming.map((m) => {
                const isLive = m.status === "live";
                return (
                  <Link
                    key={m.id}
                    href={m.href}
                    className="group flex overflow-hidden rounded-lg border border-white/10 bg-surface transition hover:border-white/25"
                  >
                    <span
                      className={`w-1 shrink-0 ${isLive ? "animate-pulse bg-gold" : "bg-white/10"}`}
                      aria-hidden="true"
                    />
                    <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-md bg-surface-2 py-2">
                          <span className="font-display text-lg font-bold leading-none text-white">
                            {new Date(m.matchDate).toLocaleDateString("en-US", { day: "2-digit" })}
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">
                            {new Date(m.matchDate).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </div>
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-surface-2 text-[10px] font-bold uppercase text-muted">
                          {m.opponentLogoUrl ? (
                            <Image
                              src={m.opponentLogoUrl}
                              alt={m.opponentName}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center">
                              {(m.opponentName || "Opponent").slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            vs {m.opponentName || "Opponent"}
                          </p>
                          <p className="truncate text-xs text-muted">{m.competition ?? "Friendly"}</p>
                        </div>
                      </div>
                      {isLive ? (
                        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded bg-gold/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gold">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                          Live now
                        </span>
                      ) : (
                        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 text-[11px] text-muted">
                          <Calendar size={12} />
                          {formatDate(m.matchDate)}
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
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo/15 text-indigo-light">
              <CheckCircle2 size={14} />
            </span>
            <h2 className="font-display text-base font-bold uppercase tracking-wide text-white">
              Results
            </h2>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {completed.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-12 text-center">
              <Swords size={32} className="text-muted/40" />
              <p className="text-sm text-muted">No completed matches yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {completed.map((m) => {
                const home = m.scoreHome ?? 0;
                const away = m.scoreAway ?? 0;
                const result = getResult(home, away);

                return (
                  <MatchResultRow
                    key={m.id}
                    href={m.href}
                    homeName={m.homeName}
                    homeAvatarUrl={m.homeAvatarUrl}
                    date={m.matchDate}
                    competition={m.competition}
                    scoreHome={home}
                    scoreAway={away}
                    opponentName={m.opponentName || "Opponent"}
                    opponentTag={m.opponentTag}
                    opponentLogoUrl={m.opponentLogoUrl}
                    matchType={m.matchType}
                    tournamentId={m.tournamentId}
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
