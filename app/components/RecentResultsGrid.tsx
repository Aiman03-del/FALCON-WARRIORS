"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Result = {
  id: string;
  slug?: string | null;
  competition: string;
  isOfficial?: boolean;
  opponent: string;
  opponentTag: string;
  opponentLogoUrl?: string | null;
  scoreHome: number;
  scoreAway: number;
  matchDate?: string;
  result: "WIN" | "DRAW" | "LOSS";
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getResultAccent(result: Result["result"]) {
  if (result === "WIN") return { accent: "var(--fw-success)", soft: "var(--fw-success-soft)" };
  if (result === "LOSS") return { accent: "var(--fw-danger)", soft: "var(--fw-danger-soft)" };
  return { accent: "var(--fw-warning)", soft: "var(--fw-warning-soft)" };
}

export default function RecentResultsGrid({
  results,
  logoUrl,
}: {
  results: Result[];
  logoUrl: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(".result-card", { opacity: 1, y: 0 });
        return;
      }

      const cards = gsap.utils.toArray<HTMLElement>(".result-card", gridRef.current);
      if (cards.length === 0) return;

      gsap.set(cards, { opacity: 0, y: 24 });

      ScrollTrigger.create({
        trigger: gridRef.current,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.09,
            clearProps: "transform,opacity",
          });
        },
      });
    },
    { scope: gridRef, dependencies: [results] }
  );

  if (results.length === 0) {
    return <p className="text-sm text-[var(--fw-text-secondary)]">No completed matches yet.</p>;
  }

  return (
    <div ref={gridRef} className="grid gap-4 md:grid-cols-2">
      {results.map((r) => {
        const accent = getResultAccent(r.result);
        const badgeStyle = {
          backgroundColor: accent.soft,
          borderColor: accent.accent,
          color: accent.accent,
        };

        return (
          <Link
            key={r.id}
            href={`/matches/${r.slug ?? r.id}`}
            className="result-card group relative flex min-h-[220px] flex-col rounded-xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-4 text-left transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[var(--fw-brand)] hover:bg-[var(--fw-bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fw-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fw-bg-primary)] sm:p-5"
            style={{ boxShadow: `inset 2px 0 0 ${accent.accent}` }}
          >
            <div className="mb-5 flex items-center justify-between gap-2 border-b border-[var(--fw-border)] pb-3">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--fw-text-muted)]">
                  {r.competition}
                </p>
                {r.isOfficial && (
                  <span className="shrink-0 rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-primary)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--fw-text-secondary)]">
                    Official
                  </span>
                )}
              </div>

              {formatDate(r.matchDate) && (
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--fw-text-muted)]">
                  {formatDate(r.matchDate)}
                </span>
              )}
            </div>

            <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
              <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-primary)] sm:h-14 sm:w-14">
                  <Image
                    src={logoUrl}
                    alt="Falcon Warriors"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <span className="max-w-[120px] truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fw-text-primary)] sm:text-[11px]">
                  Falcon Warriors
                </span>
              </div>

              <div className="font-display text-[clamp(2rem,4vw,3.4rem)] font-black leading-none tracking-[-0.06em] text-[var(--fw-text-primary)]">
                {r.scoreHome} <span className="text-[var(--fw-text-muted)]">—</span> {r.scoreAway}
              </div>

              <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-primary)] text-[10px] font-black uppercase tracking-[0.12em] text-[var(--fw-text-secondary)] sm:h-14 sm:w-14">
                  {r.opponentLogoUrl ? (
                    <Image
                      src={r.opponentLogoUrl}
                      alt={r.opponent}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    r.opponentTag.slice(0, 2)
                  )}
                </div>
                <span className="max-w-[120px] truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fw-text-primary)] sm:text-[11px]">
                  {r.opponent}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--fw-border)] pt-3">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]"
                style={badgeStyle}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                {r.result}
              </span>

              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--fw-text-muted)]">
                Full time
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}