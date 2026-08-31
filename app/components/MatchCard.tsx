import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";

type Props = {
  id: string;
  status: "upcoming" | "live" | "completed";
  date: string;
  competition: string | null;
  scoreHome?: number | null;
  scoreAway?: number | null;
  opponentName: string;
  opponentTag?: string | null;
  opponentLogoUrl?: string | null;
  matchType?: string | null;
  tournamentId?: string | null;
  result?: "WIN" | "DRAW" | "LOSS" | null;
};

const statusConfig: Record<
  Props["status"],
  { label: string; bgClass: string; textClass: string }
> = {
  upcoming: {
    label: "Upcoming",
    bgClass: "bg-transparent",
    textClass: "text-[var(--fw-text-muted)]",
  },
  live: {
    label: "Live",
    bgClass: "bg-[var(--fw-success)]/15",
    textClass: "text-[var(--fw-success)]",
  },
  completed: {
    label: "Completed",
    bgClass: "bg-transparent",
    textClass: "text-[var(--fw-text-muted)]",
  },
};

const resultConfig: Record<
  string,
  { label: string; bgClass: string; textClass: string }
> = {
  WIN: {
    label: "Win",
    bgClass: "bg-[var(--fw-success)]/15",
    textClass: "text-[var(--fw-success)]",
  },
  DRAW: {
    label: "Draw",
    bgClass: "bg-[var(--fw-border)]",
    textClass: "text-[var(--fw-text-secondary)]",
  },
  LOSS: {
    label: "Loss",
    bgClass: "bg-[var(--fw-danger)]/15",
    textClass: "text-[var(--fw-danger)]",
  },
};

function formatMatchDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function formatMatchTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function TeamLogo({
  tag,
  name,
  logoUrl,
}: {
  tag: string;
  name: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[var(--fw-radius-md)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface-hover)] flex items-center justify-center">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="48px"
        />
      ) : (
        <span className="text-xs font-bold text-[var(--fw-text-muted)]">
          {tag.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default async function MatchCard({
  id,
  status,
  date,
  competition,
  scoreHome,
  scoreAway,
  opponentName,
  opponentTag,
  opponentLogoUrl,
  result,
}: Props) {
  const { logoUrl: falconLogoUrl } = await getSiteSettings();
  const statusInfo = statusConfig[status];
  const resultInfo = result && resultConfig[result];

  const isUpcoming = status === "upcoming";
  const isLive = status === "live";
  const isCompleted = status === "completed";

  return (
    <Link
      href={`/matches/${id}`}
      className="group rounded-[var(--fw-radius-lg)] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] overflow-hidden transition-all duration-300 hover:border-[var(--fw-brand)] hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--fw-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--fw-success)] animate-pulse" />
          )}
          <span
            className={`text-[9px] font-bold uppercase tracking-[0.12em] ${statusInfo.textClass}`}
          >
            {statusInfo.label}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-[var(--fw-text-muted)]">
          {formatMatchDate(date)} · {formatMatchTime(date)}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-6">
        {/* Competition info if available */}
        {competition && (
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--fw-text-muted)]">
            {competition}
          </p>
        )}

        {/* Teams layout */}
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Home team (Falcon Warriors) */}
          <div className="flex items-center gap-3 col-start-1">
            <TeamLogo
              tag="FW"
              name="Falcon Warriors"
              logoUrl={falconLogoUrl}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--fw-text-primary)] truncate">
                Falcon Warriors
              </p>
            </div>
          </div>

          {/* Score or VS */}
          <div className="flex flex-col items-center justify-center col-start-2">
            {isUpcoming ? (
              <span className="font-display text-2xl font-black text-[var(--fw-text-primary)]">
                VS
              </span>
            ) : (
              <>
                <span className="font-display text-3xl font-black tabular-nums text-[var(--fw-text-primary)]">
                  {scoreHome ?? 0}
                </span>
                <span className="my-1 text-[var(--fw-text-muted)]">·</span>
                <span className="font-display text-3xl font-black tabular-nums text-[var(--fw-text-primary)]">
                  {scoreAway ?? 0}
                </span>
              </>
            )}
          </div>

          {/* Away team (Opponent) */}
          <div className="flex items-center justify-end gap-3 col-start-3">
            <div className="min-w-0 text-right">
              <p className="text-sm font-bold text-[var(--fw-text-primary)] truncate">
                {opponentName}
              </p>
            </div>
            <TeamLogo
              tag={opponentTag ?? opponentName}
              name={opponentName}
              logoUrl={opponentLogoUrl}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--fw-border)] px-5 py-4">
        {/* Result badge */}
        {isCompleted && resultInfo ? (
          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${resultInfo.bgClass} ${resultInfo.textClass}`}
          >
            {resultInfo.label}
          </span>
        ) : (
          <div />
        )}

        {/* CTA */}
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--fw-brand)] group-hover:gap-2 transition-all duration-200">
          View Match
          <ArrowRight
            size={12}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
}
