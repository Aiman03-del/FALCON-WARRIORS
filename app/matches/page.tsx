import { createClient } from "@/app/lib/supabase/server";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Swords, Calendar, CheckCircle2, Clock } from "lucide-react";

export const metadata = {
  title: "Matches | Falcon Warriors",
  description: "All match results, upcoming fixtures and live games for Falcon Warriors eFootball club.",
};

const resultStyles = {
  WIN: "bg-indigo/20 text-indigo-light border-indigo/40",
  DRAW: "bg-white/10 text-muted border-white/20",
  LOSS: "bg-red-500/15 text-red-400 border-red-500/30",
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

export default async function MatchesPage() {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent_name, opponent_tag, competition, match_date, status, score_home, score_away")
    .order("match_date", { ascending: false });

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
                  <div key={m.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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
                      <span className="inline-flex w-fit animate-pulse items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        LIVE NOW
                      </span>
                    ) : (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs text-muted">
                        <Calendar size={11} />
                        {formatDate(m.match_date)}
                      </span>
                    )}
                  </div>
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
                const tag = m.opponent_tag ?? m.opponent_name?.slice(0, 3).toUpperCase() ?? "OPP";
                return (
                  <div key={m.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{formatDate(m.match_date)}</span>
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px]">
                        {m.competition ?? "Friendly"}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
                          FW
                        </div>
                        <span className="text-[10px] text-muted">Falcon Warriors</span>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-2xl font-bold">
                          {home} – {away}
                        </p>
                        <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${resultStyles[result]}`}>
                          {result}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">
                          {tag.slice(0, 2)}
                        </div>
                        <span className="max-w-[72px] truncate text-center text-[10px] text-muted">
                          {m.opponent_name}
                        </span>
                      </div>
                    </div>
                  </div>
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
