import Link from "next/link";
import { H2HResult } from "../lib/queries/h2h";

export default function H2HSummary({
  h2h,
  homeLabel,
  awayLabel,
}: {
  h2h: H2HResult;
  homeLabel: string;
  awayLabel: string;
}) {
  if (h2h.totalMeetings === 0) {
    return (
      <div className="card p-6 text-center text-sm text-muted">
        No past matches recorded between these two.
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-around text-center">
        <div>
          <p className="font-display text-2xl font-bold text-gold">{h2h.homeWins}</p>
          <p className="text-[10px] uppercase text-muted">{homeLabel} Wins</p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-muted">{h2h.draws}</p>
          <p className="text-[10px] uppercase text-muted">Draws</p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-white">{h2h.awayWins}</p>
          <p className="text-[10px] uppercase text-muted">{awayLabel} Wins</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {h2h.recentMeetings.map((m) => (
          <Link
            key={m.id}
            href={`/matches/${m.id}`}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-surface-2"
          >
            <span className="text-muted">
              {new Date(m.date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <span className="font-display font-semibold text-white">
              {m.scoreHome} - {m.scoreAway}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}