"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Layers, Trophy } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Tournament = {
  id: string;
  slug?: string | null;
  name: string;
  type: "internal" | "official";
  format: string | null;
  status: "ongoing" | "upcoming" | "completed";
  startDate: string | null;
  endDate: string | null;
};

type Performer = {
  id: string;
  slug?: string | null;
  name: string;
  username: string;
  avatarUrl?: string | null;
  statLabel: string;
  statValue: string;
  record?: string;
};

type Props = {
  tournaments: Tournament[];
  performers: Performer[];
};

const formatLabels: Record<string, string> = {
  league: "League",
  knockout: "Knockout",
  group_knockout: "Group + Knockout",
  league_playoff: "League + Playoff",
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

function getTournamentStatusLabel(status: Tournament["status"]) {
  if (status === "ongoing") return "Live";
  if (status === "completed") return "Ended";
  return "Upcoming";
}

function getTournamentStatusClass(status: Tournament["status"]) {
  if (status === "ongoing") return "border-[var(--fw-danger)] bg-[var(--fw-danger-soft)] text-[var(--fw-danger)]";
  if (status === "completed") return "border-[var(--fw-brand)] bg-[var(--fw-brand-soft)] text-[var(--fw-brand)]";
  return "border-[var(--fw-border)] bg-[var(--fw-bg-primary)] text-[var(--fw-text-secondary)]";
}

export default function FixturesAndPerformers({ tournaments, performers }: Props) {
  const tournamentsRef = useRef<HTMLDivElement>(null);
  const performersRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set(".tournament-card, .performer-card", { opacity: 1, x: 0, y: 0 });
      return;
    }

    if (tournamentsRef.current) {
      const cards = gsap.utils.toArray<HTMLElement>(".tournament-card", tournamentsRef.current);
      if (cards.length > 0) {
        gsap.set(cards, { opacity: 0, x: -18 });

        ScrollTrigger.create({
          trigger: tournamentsRef.current,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              x: 0,
              duration: 0.6, // fw-animation-reveal
              ease: "power2.out",
              stagger: 0.1, // standardized stagger
              clearProps: "transform,opacity",
            });
          },
        });
      }
    }

    if (performersRef.current) {
      const cards = gsap.utils.toArray<HTMLElement>(".performer-card", performersRef.current);
      if (cards.length > 0) {
        gsap.set(cards, { opacity: 0, x: 16 });

        ScrollTrigger.create({
          trigger: performersRef.current,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              x: 0,
              duration: 0.6, // fw-animation-reveal
              ease: "power2.out",
              stagger: 0.1, // standardized stagger
              clearProps: "transform,opacity",
            });
          },
        });
      }
    }
  }, { dependencies: [tournaments, performers] });

  return (
    <section className="relative border-b bg-[var(--fw-bg-primary)]" style={{ borderColor: 'var(--fw-border)' }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_center,rgba(91,117,255,0.08),transparent_60%)]" />

      <div className="relative fw-container fw-section">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--fw-brand)] sm:text-[11px]">
            UP NEXT
          </p>
          <h2 className="font-display text-3xl font-black uppercase tracking-[-0.04em] text-[var(--fw-text-primary)] sm:text-4xl lg:text-[2.9rem]">
            MATCHDAY & PLAYER SPOTLIGHT
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-base">
            The next challenge and the Warriors leading the way.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.12fr_0.88fr] md:gap-7">
          <div className="rounded-2xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--fw-brand)] sm:text-[11px]">
                NEXT BATTLE
              </h3>
              <Link
                href="/tournaments"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fw-text-primary)] transition-colors hover:text-[var(--fw-brand)]"
              >
                View all <ArrowUpRight size={12} />
              </Link>
            </div>

            {tournaments.length === 0 ? (
              <p className="text-sm text-[var(--fw-text-secondary)]">No tournaments available right now.</p>
            ) : (
              <div ref={tournamentsRef} className="flex flex-col gap-3">
                {tournaments.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tournaments/${t.slug ?? t.id}`}
                    className="tournament-card group rounded-xl border border-[var(--fw-border)] bg-[var(--fw-bg-primary)] p-3 text-left transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[var(--fw-brand)] hover:bg-[var(--fw-bg-surface-hover)] sm:p-4"
                    style={{ boxShadow: "inset 2px 0 0 var(--fw-brand)" }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className="inline-flex rounded-full border border-[var(--fw-border)] bg-[var(--fw-brand-soft)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--fw-brand)]">
                        {t.type === "official" ? "Official" : "Internal"}
                      </span>

                      <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${getTournamentStatusClass(t.status)}`}>
                        {getTournamentStatusLabel(t.status)}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--fw-text-muted)]">
                        {t.name}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.1em] text-[var(--fw-text-secondary)]">
                        {formatLabels[t.format ?? ""] && <span>{formatLabels[t.format ?? ""]}</span>}
                        {formatDate(t.startDate) && (
                          <>
                            <span>•</span>
                            <span>{formatDate(t.startDate)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] text-[var(--fw-brand)] sm:h-14 sm:w-14">
                          <Trophy size={18} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--fw-text-muted)]">
                          Falcon
                        </span>
                      </div>

                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--fw-text-muted)]">
                          VS
                        </p>
                      </div>

                      <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--fw-text-muted)]">
                          Opponent
                        </span>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] text-[var(--fw-brand)] sm:h-14 sm:w-14">
                          <Layers size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--fw-border)] pt-3">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--fw-text-secondary)]">
                        {formatDate(t.startDate) ?? "Matchday"}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--fw-text-primary)]">
                        Match details →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--fw-brand)] sm:text-[11px]">
                TOP WARRIORS
              </h3>
              <Link
                href="/players"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fw-text-primary)] transition-colors hover:text-[var(--fw-brand)]"
              >
                View all <ArrowUpRight size={12} />
              </Link>
            </div>

            {performers.length === 0 ? (
              <p className="text-sm text-[var(--fw-text-secondary)]">No matches played yet — check back once results are in.</p>
            ) : (
              <div ref={performersRef} className="space-y-3">
                {performers.map((p, index) => (
                  <Link
                    key={p.id || p.name}
                    href={`/players/${p.slug ?? p.id}`}
                    className="performer-card group flex items-center gap-3 rounded-xl border border-[var(--fw-border)] bg-[var(--fw-bg-primary)] p-3 transition-all duration-200 ease-out hover:-translate-x-1 hover:border-[var(--fw-brand)] hover:bg-[var(--fw-bg-surface-hover)] sm:p-3.5"
                  >
                    <div className="flex w-7 items-center justify-center text-[11px] font-black uppercase tracking-[0.12em] text-[var(--fw-text-muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] sm:h-12 sm:w-12">
                      {p.avatarUrl ? (
                        <Image
                          src={p.avatarUrl}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] font-black uppercase tracking-[0.12em] text-[var(--fw-brand)]">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--fw-text-primary)] group-hover:text-[var(--fw-brand)]">
                        {p.name}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[var(--fw-text-muted)]">
                        {p.statValue} {p.statLabel}
                      </p>
                    </div>

                    <ArrowUpRight className="shrink-0 text-[var(--fw-text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--fw-brand)]" size={16} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}