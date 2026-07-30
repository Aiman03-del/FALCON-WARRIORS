import Image from "next/image";
import Link from "next/link";
import { Edit3 } from "lucide-react";
import DeleteMatchButton from "./DeleteMatchButton";

const statusStyles: Record<string, string> = {
  upcoming: "bg-white/10 text-muted",
  live: "bg-red-500/15 text-red-400",
  completed: "bg-indigo/20 text-indigo-light",
};

type MatchCardProps = {
  id: string;
  slug?: string | null;
  opponentName: string | null;   // null অনুমতি দিন
  opponentLogoUrl?: string | null;
  competition?: string | null;
  matchDate: string;
  status: string;
  scoreHome: number | null;
  scoreAway: number | null;
};

export default function MatchCard({
  id,
  slug,
  opponentName,
  opponentLogoUrl,
  competition,
  matchDate,
  status,
  scoreHome,
  scoreAway,
}: MatchCardProps) {
  const date = new Date(matchDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <Link href={`/dashboard/matches/${slug ?? id}`}>
      <div className="card group p-6 transition hover:bg-surface-2">
        {/* Date and Status */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-muted font-medium">{formattedDate}</span>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Match Content */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div
              className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold/60 bg-gold/10"
            >
              <Image
                src="/logo.jpg"
                alt="Falcon Warriors"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <span className="text-center text-xs font-semibold leading-tight text-foreground">
              Falcon Warriors
            </span>
          </div>

          {/* Score Section */}
          <div className="flex flex-col items-center gap-3">
            {scoreHome !== null && scoreAway !== null ? (
              <div className="font-display text-3xl font-bold text-gold">
                {scoreHome} <span className="text-muted text-2xl">-</span> {scoreAway}
              </div>
            ) : (
              <div className="font-display text-xl font-bold text-muted">VS</div>
            )}
            <span className="text-xs text-muted font-medium">{competition || "—"}</span>
          </div>

          {/* Away Team */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div
              className="relative h-12 w-12 overflow-hidden rounded-full bg-surface-2 border border-border"
            >
              {opponentLogoUrl ? (
                <Image
                  src={opponentLogoUrl}
                  alt={opponentName?.trim() ? opponentName : "Opponent team logo"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-xs font-bold text-white/70">
                  {opponentName?.trim() ? opponentName.slice(0, 2).toUpperCase() : "?"}
                </div>
              )}
            </div>
            <span className="text-center text-xs font-semibold leading-tight text-foreground">
              {opponentName?.trim() ? opponentName : "TBD"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4 opacity-0 transition group-hover:opacity-100">
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 text-gold transition hover:bg-gold/10 hover:text-gold-light"
            aria-label="View match"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Edit3 size={16} />
          </button>
          <div onClick={(e) => e.preventDefault()}>
            <DeleteMatchButton id={id} />
          </div>
        </div>
      </div>
    </Link>
  );
}