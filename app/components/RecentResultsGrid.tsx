"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Result = {
  id: string;
  href: string;
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, results.length - 1));
    const slide = track.children[clamped] as HTMLElement | undefined;
    if (slide) {
      track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    }
    setActiveIndex(clamped);
  }

  function handleTrackScroll() {
    const track = trackRef.current;
    if (!track) return;
    let closestIndex = 0;
    let closestDistance = Infinity;
    Array.from(track.children).forEach((child, index) => {
      const distance = Math.abs((child as HTMLElement).offsetLeft - track.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveIndex(closestIndex);
  }

  return (
    <div ref={gridRef} className="relative">
      <div
        ref={trackRef}
        onScroll={handleTrackScroll}
        className="fw-carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
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
              href={r.href}
              className="result-card group relative flex min-h-[220px] w-[85%] shrink-0 snap-start flex-col rounded-xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-4 text-left transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[var(--fw-brand)] hover:bg-[var(--fw-bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fw-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fw-bg-primary)] sm:w-[calc(50%-0.5rem)] sm:p-5"
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

      {results.length > 1 && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {results.map((r, index) => (
              <button
                key={r.id}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === activeIndex
                    ? "w-6 bg-[var(--fw-brand)]"
                    : "w-1.5 bg-[var(--fw-border)] hover:bg-[var(--fw-border-hover)]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous match"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--fw-border)] text-[var(--fw-text-primary)] transition-colors duration-200 hover:border-[var(--fw-brand)] hover:text-[var(--fw-brand)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--fw-border)] disabled:hover:text-[var(--fw-text-primary)]"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === results.length - 1}
              aria-label="Next match"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--fw-border)] text-[var(--fw-text-primary)] transition-colors duration-200 hover:border-[var(--fw-brand)] hover:text-[var(--fw-brand)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--fw-border)] disabled:hover:text-[var(--fw-text-primary)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}