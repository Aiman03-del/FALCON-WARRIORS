"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Edit3, Trophy, CalendarDays, Share2 } from "lucide-react";
import DeleteMatchButton from "./DeleteMatchButton";
import MatchPosterModal from "@/app/components/dashboard/MatchPosterModal";

const statusStyles: Record<string, string> = {
  upcoming:
    "border border-border/80 bg-surface-2/60 text-muted",
  live:
    "border border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_14px_rgba(239,68,68,0.12)]",
  completed:
    "border border-indigo/40 bg-indigo/10 text-indigo-light shadow-[0_0_14px_rgba(99,102,241,0.08)]",
};

type MatchCardProps = {
  id: string;
  slug?: string | null;
  kind?: "official" | "internal";
  homeName?: string;
  homeLogoUrl?: string | null;
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
  kind = "official",
  homeName,
  homeLogoUrl,
  opponentName,
  opponentLogoUrl,
  competition,
  matchDate,
  status,
  scoreHome,
  scoreAway,
  logoUrl,
}: MatchCardProps) {
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const date = new Date(matchDate);

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const hasScore = scoreHome !== null && scoreAway !== null;
  const isLive = status === "live";
  const isCompleted = status === "completed";
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/matches/${slug ?? id}`
      : "";

  return (
    <>
      <Link
        href={`/dashboard/matches/${slug ?? id}`}
        className="block h-full"
      >
        <div
          className="
            group relative flex h-full min-h-[290px] flex-col overflow-hidden
            rounded-2xl border border-border
            bg-surface
            transition-all duration-300
            hover:-translate-y-1
            hover:border-gold/40
            hover:shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_28px_rgba(212,175,55,0.08)]
          "
        >
        {/* Ambient Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-20 h-40 w-40 rounded-full bg-gold/5 blur-3xl transition-all duration-500 group-hover:bg-gold/10" />

          <div className="absolute -right-20 bottom-0 h-44 w-44 rounded-full bg-indigo/5 blur-3xl transition-all duration-500 group-hover:bg-indigo/10" />

          <div
            className="
              absolute inset-0 opacity-[0.025]
              [background-image:linear-gradient(135deg,white_1px,transparent_1px)]
              [background-size:22px_22px]
            "
          />

          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-60" />
        </div>

        {/* Top Section */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
            <CalendarDays size={13} className="text-muted/80" />
            <span>{formattedDate}</span>
          </div>

          <span
            className={`
              flex items-center gap-1.5 rounded-full px-2.5 py-1
              text-[9px] font-bold uppercase tracking-[0.12em]
              ${statusStyles[status] ?? statusStyles.upcoming}
            `}
          >
            {isLive && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
              </span>
            )}

            {isCompleted && (
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-light" />
            )}

            {status}
          </span>
        </div>

        {/* Match Area */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 pt-6">
          {/* Home Team */}
          <div className="flex w-[35%] flex-col items-center">
            <div
              className={`
                relative h-[68px] w-[68px] overflow-hidden rounded-full
                transition-all duration-300
                ${
                  kind === "internal"
                    ? "border border-border bg-surface-2 shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                    : "border-2 border-gold/70 bg-gold/10 shadow-[0_0_22px_rgba(212,175,55,0.18)] group-hover:shadow-[0_0_28px_rgba(212,175,55,0.28)]"
                }
              `}
            >
              {kind === "internal" ? (
                homeLogoUrl ? (
                  <Image
                    src={homeLogoUrl}
                    alt={homeName?.trim() ? homeName : "Player"}
                    fill
                    sizes="68px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-white/70">
                    {homeName?.trim()
                      ? homeName.slice(0, 2).toUpperCase()
                      : "?"}
                  </div>
                )
              ) : (
                <Image
                  src={logoUrl}
                  alt="Falcon Warriors"
                  fill
                  sizes="68px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="mt-3 max-w-full text-center">
              <p className="truncate text-[12px] font-bold text-foreground">
                {kind === "internal"
                  ? homeName?.trim()
                    ? homeName
                    : "TBD"
                  : "Falcon Warriors"}
              </p>

              <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
                {kind === "internal" ? "HOME" : "FW"}
              </span>
            </div>
          </div>

          {/* Center Score */}
          <div className="flex w-[30%] flex-col items-center justify-center">
            {hasScore ? (
              <>
                <div className="flex items-center gap-2 font-display leading-none">
                  <span
                    className={`text-3xl font-bold ${
                      isCompleted && scoreHome! > scoreAway!
                        ? "text-gold"
                        : "text-foreground"
                    }`}
                  >
                    {scoreHome}
                  </span>

                  <span className="text-xl font-medium text-muted/70">
                    —
                  </span>

                  <span
                    className={`text-3xl font-bold ${
                      isCompleted && scoreAway! > scoreHome!
                        ? "text-gold"
                        : "text-foreground"
                    }`}
                  >
                    {scoreAway}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <span className="h-px w-5 bg-border" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                    Final
                  </span>
                  <span className="h-px w-5 bg-border" />
                </div>
              </>
            ) : (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-2/80">
                  <span className="font-display text-sm font-bold text-muted">
                    VS
                  </span>
                </div>

                <span className="mt-3 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  Matchup
                </span>
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="flex w-[35%] flex-col items-center">
            <div
              className="
                relative h-[68px] w-[68px] overflow-hidden rounded-full
                border border-border bg-surface-2
                shadow-[0_0_20px_rgba(255,255,255,0.03)]
                transition-all duration-300
                group-hover:border-border/80
              "
            >
              {opponentLogoUrl ? (
                <Image
                  src={opponentLogoUrl}
                  alt={
                    opponentName?.trim()
                      ? opponentName
                      : "Opponent team logo"
                  }
                  fill
                  sizes="68px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-white/50">
                  {opponentName?.trim()
                    ? opponentName.slice(0, 2).toUpperCase()
                    : "?"}
                </div>
              )}
            </div>

            <div className="mt-3 max-w-full text-center">
              <p className="truncate text-[12px] font-bold text-foreground">
                {opponentName?.trim() ? opponentName : "TBD"}
              </p>

              <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                {opponentName?.trim() ? "AWAY" : "TBD"}
              </span>
            </div>
          </div>
        </div>

        {/* Competition / Match Info */}
        <div className="relative z-10 mx-5 mb-4 mt-3">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px flex-1 bg-border/70" />

            <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2/70 px-3 py-1.5">
              {isCompleted && (
                <Trophy size={11} className="text-gold" />
              )}

              <span className="max-w-[150px] truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                {competition || "Match 01"}
              </span>
            </div>

            <span className="h-px flex-1 bg-border/70" />
          </div>
        </div>

        {/* Actions */}
        <div
          className="
            relative z-20 flex items-center justify-end gap-1.5
            border-t border-border/70 bg-surface-2/30
            px-4 py-2.5
            opacity-0 transition-all duration-300
            group-hover:opacity-100
          "
        >
          <button
            className="
              inline-flex items-center justify-center rounded-lg p-2
              text-muted transition
              hover:bg-gold/10 hover:text-gold
            "
            aria-label="Share match poster"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPosterOpen(true);
            }}
          >
            <Share2 size={15} />
          </button>

          <button
            className="
              inline-flex items-center justify-center rounded-lg p-2
              text-muted transition
              hover:bg-gold/10 hover:text-gold
            "
            aria-label="Edit match"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Edit3 size={15} />
          </button>

          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <DeleteMatchButton id={id} />
          </div>
        </div>

        {/* Bottom Accent */}
        <div
          className={`
            pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-0
            -translate-x-1/2 transition-all duration-500
            group-hover:w-1/2
            ${
              isLive
                ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                : "bg-gold shadow-[0_0_12px_rgba(212,175,55,0.5)]"
            }
          `}
        />
      </div>
    </Link>

      {isPosterOpen && (
        <MatchPosterModal
          homeName={kind === "internal" ? homeName?.trim() || "Falcon Warriors" : "Falcon Warriors"}
          homeLogoUrl={kind === "internal" ? homeLogoUrl : logoUrl}
          opponentName={opponentName}
          opponentLogoUrl={opponentLogoUrl}
          competition={competition}
          matchDate={matchDate}
          status={status}
          scoreHome={scoreHome}
          scoreAway={scoreAway}
          logoUrl={logoUrl}
          shareUrl={shareUrl}
          onClose={() => setIsPosterOpen(false)}
        />
      )}
    </>
  );
}