import Image from "next/image";
import Link from "next/link";
import { Edit3, Radio } from "lucide-react";
import DeleteMatchButton from "./DeleteMatchButton";

const statusStyles: Record<string, string> = {
  upcoming: "border border-border text-muted bg-transparent",
  live: "border border-red-500/40 text-red-400 bg-red-500/10",
  completed: "border border-indigo/40 text-indigo-light bg-indigo/10",
};

type MatchCardProps = {
  id: string;
  slug?: string | null;
  opponentName: string | null;
  opponentLogoUrl?: string | null;
  competition?: string | null;
  matchDate: string;
  status: string;
  scoreHome: number | null;
  scoreAway: number | null;
  logoUrl: string;
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
  logoUrl,
}: MatchCardProps) {
  const date = new Date(matchDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <Link href={`/dashboard/matches/${slug ?? id}`} className="block h-full">
      <div className="card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_24px_rgba(212,175,55,0.12)]">
        {/* Date and Status */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-muted font-medium">{formattedDate}</span>
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles[status]}`}
          >
            {status === "live" && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
              </span>
            )}
            {status}
          </span>
        </div>

        {/* Match Content */}
        <div className="flex flex-1 items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gold/60 bg-gold/10 shadow-[0_0_14px_rgba(212,175,55,0.25)]">
              <Image
                src={logoUrl}
                alt="Falcon Warriors"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <span className="max-w-full truncate text-center text-xs font-semibold leading-tight text-foreground">
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
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-xs font-bold text-white/70">
                  {opponentName?.trim() ? opponentName.slice(0, 2).toUpperCase() : "?"}
                </div>
              )}
            </div>
            <span className="max-w-full truncate text-center text-xs font-semibold leading-tight text-foreground">
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