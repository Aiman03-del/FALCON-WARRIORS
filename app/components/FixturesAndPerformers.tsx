type Fixture = {
  id: string;
  day: string;
  month: string;
  opponent: string;
  competition: string;
  status: string;
  live?: boolean;
};

type Performer = {
  name: string;
  statLabel: string;
  statValue: string;
};

type Props = {
  fixtures: Fixture[];
  performers: Performer[];
};

export default function FixturesAndPerformers({ fixtures, performers }: Props) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-2">
        {/* Fixtures */}
        <div>
          <div className="section-divider" />
          <h2 className="mb-5 font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
            Fixtures
          </h2>

          {fixtures.length === 0 ? (
            <p className="text-sm text-muted">No upcoming fixtures scheduled.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {fixtures.map((f) => (
                <div key={f.id} className="card flex items-center justify-between gap-3 p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-2 py-1 sm:w-12">
                      <span className="font-display text-base font-bold leading-none sm:text-lg">
                        {f.day}
                      </span>
                      <span className="text-[9px] uppercase text-muted sm:text-[10px]">{f.month}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{f.opponent}</p>
                      <p className="truncate text-xs text-muted">{f.competition}</p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:px-3 ${
                      f.live ? "bg-gold/15 text-gold" : "bg-white/10 text-muted"
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
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
            <p className="text-sm text-muted">No stats recorded yet.</p>
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
