import Link from "next/link";
import { Layers, Trophy } from "lucide-react";

type Tournament = {
  id: string;
  slug?: string | null;
  name: string;
  type: "internal" | "official";
  format: string | null;
  status: "ongoing" | "upcoming";
  startDate: string | null;
  endDate: string | null;
};

type Performer = {
  name: string;
  statLabel: string;
  statValue: string;
};

type Props = {
  tournaments: Tournament[];
  performers: Performer[];
};

const formatLabels: Record<string, string> = {
  league: "League",
  knockout: "Knockout",
  group_knockout: "Group + Knockout",
  league_playoff: "League + Playoff",
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

export default function FixturesAndPerformers({ tournaments, performers }: Props) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-2">
        {/* Running Tournaments */}
        <div>
          <div className="section-divider" />
          <div className="mb-5 flex items-center justify-between gap-2">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
              Tournaments
            </h2>
            <Link href="/tournaments" className="text-sm font-medium text-gold hover:text-gold-light">
              View All →
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <p className="text-sm text-muted">No ongoing or upcoming tournaments right now.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {tournaments.map((t) => (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.slug ?? t.id}`}
                  className="card group flex items-center justify-between gap-3 p-3 transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold sm:h-12 sm:w-12">
                      <Trophy size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white transition group-hover:text-gold">
                        {t.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted">
                        <span className="uppercase">{t.type === "official" ? "Official" : "Internal"}</span>
                        {t.format && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Layers size={10} />
                              {formatLabels[t.format] ?? t.format}
                            </span>
                          </>
                        )}
                        {formatDate(t.startDate) && (
                          <>
                            <span>·</span>
                            <span>{formatDate(t.startDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase sm:px-3 ${
                      t.status === "ongoing" ? "bg-red-500/15 text-red-400" : "bg-white/10 text-muted"
                    }`}
                  >
                    {t.status === "ongoing" ? "🔴 Live" : "Upcoming"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div>
          <div className="section-divider" />
          <h2 className="mb-5 font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
            Top Performers
          </h2>

          {performers.length === 0 ? (
            <p className="text-sm text-muted">No matches played yet — check back once results are in.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2">
              {performers.map((p) => (
                <div key={p.name} className="card flex items-center gap-3 p-3 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-sm font-bold text-gold">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-[10px] uppercase tracking-wide text-gold">
                      {p.statLabel}: {p.statValue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
