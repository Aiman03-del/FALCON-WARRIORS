import Link from "next/link";

type Result = {
  id: string;
  competition: string;
  opponent: string;
  opponentTag: string;
  scoreHome: number;
  scoreAway: number;
  result: "WIN" | "DRAW" | "LOSS";
};

const resultStyles: Record<Result["result"], string> = {
  WIN: "bg-indigo/20 text-indigo-light border-indigo/40",
  DRAW: "bg-white/10 text-muted border-white/20",
  LOSS: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function RecentResults({ results }: { results: Result[] }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="section-divider" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
              Recent Results
            </h2>
          </div>
          <Link
            href="/matches"
            className="text-sm font-medium text-gold hover:text-gold-light"
          >
            View All →
          </Link>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-muted">No completed matches yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {results.map((r) => (
              <div key={r.id} className="card p-4 sm:p-5">
                <p className="mb-3 text-xs uppercase tracking-wide text-muted">
                  {r.competition}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold sm:h-10 sm:w-10">
                      FW
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${resultStyles[r.result]}`}
                    >
                      {r.result}
                    </span>
                  </div>

                  <div className="font-display text-2xl font-bold sm:text-3xl">
                    {r.scoreHome} - {r.scoreAway}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70 sm:h-10 sm:w-10">
                      {r.opponentTag.slice(0, 2)}
                    </div>
                    <span className="max-w-[64px] truncate text-center text-[10px] text-muted">
                      {r.opponent}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}