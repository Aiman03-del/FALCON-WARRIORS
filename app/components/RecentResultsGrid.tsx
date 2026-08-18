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

const resultStyles: Record<Result["result"], string> = {
  WIN: "bg-indigo/20 text-indigo-light border-indigo/40",
  DRAW: "bg-white/10 text-muted border-white/20",
  LOSS: "bg-red-500/15 text-red-400 border-red-500/30",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
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
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(".result-card", gridRef.current);
      if (cards.length === 0) return;

      gsap.set(cards, { opacity: 0, y: 28 });

      ScrollTrigger.create({
        trigger: gridRef.current,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.08,
            clearProps: "transform,opacity",
          });
        },
      });
    },
    { scope: gridRef, dependencies: [results] }
  );

  if (results.length === 0) {
    return <p className="text-sm text-muted">No completed matches yet.</p>;
  }

  return (
    <div ref={gridRef} className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {results.map((r) => (
        <Link
          key={r.id}
          href={`/matches/${r.slug ?? r.id}`}
          className="result-card card group relative overflow-hidden p-4 transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs uppercase tracking-wide text-muted">
                {r.competition}
              </p>
              {r.isOfficial && (
                <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold">
                  Official
                </span>
              )}
            </div>
            {formatDate(r.matchDate) && (
              <span className="shrink-0 text-[10px] text-muted">{formatDate(r.matchDate)}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-black sm:h-12 sm:w-12">
                <Image src={logoUrl} alt="Falcon Warriors" fill sizes="(min-width: 640px) 48px, 40px" className="object-cover" />
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${resultStyles[r.result]}`}
              >
                {r.result}
              </span>
            </div>

            <div className="font-display text-2xl font-bold transition group-hover:text-gold sm:text-3xl">
              {r.scoreHome} - {r.scoreAway}
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-bold text-white/70 sm:h-12 sm:w-12">
                {r.opponentLogoUrl ? (
                  <Image
                    src={r.opponentLogoUrl}
                    alt={r.opponent}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  r.opponentTag.slice(0, 2)
                )}
              </div>
              <span className="max-w-18 truncate text-center text-[10px] text-muted">
                {r.opponent}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}