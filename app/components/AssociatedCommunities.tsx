"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { AssociatedCommunity } from "../lib/queries/communities";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AssociatedCommunities({
  communities,
}: {
  communities: AssociatedCommunity[];
}) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set(".community-heading, .community-description, .community-card", {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const heading = containerRef.current.querySelectorAll<HTMLElement>(
        ".community-heading, .community-description"
      );
      const cards = gsap.utils.toArray<HTMLElement>(".community-card", containerRef.current);

      if (heading.length) {
        gsap.from(heading, {
          opacity: 0,
          y: 18,
          duration: 0.6, // fw-animation-reveal
          ease: "power2.out",
          stagger: 0.1, // standardized stagger
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 88%",
            once: true,
          },
        });
      }

      if (cards.length) {
        gsap.from(cards, {
          opacity: 0,
          y: 20,
          duration: 0.6, // fw-animation-reveal
          ease: "power2.out",
          stagger: 0.1, // standardized stagger
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 82%",
            once: true,
          },
        });
      }
    },
    { scope: containerRef, dependencies: [communities] }
  );

  if (communities.length === 0) return null;

  return (
    <section ref={containerRef} className="relative overflow-hidden border-t bg-[var(--fw-bg-primary)]" style={{ borderColor: 'var(--fw-border)' }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_center,rgba(91,117,255,0.12),transparent_60%)]" />

      <div className="relative fw-container fw-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="community-heading mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--fw-brand)] sm:text-[11px]">
            OUR COMMUNITY
          </p>
          <h2 className="community-heading text-balance text-3xl font-black uppercase tracking-[-0.04em] text-[var(--fw-text-primary)] sm:text-4xl lg:text-5xl">
            STRONGER TOGETHER.
          </h2>
          <p className="community-description mx-auto mt-4 max-w-[560px] text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-base">
            Connected with communities that share our passion for competitive eFootball.
          </p>
        </div>

        <div className="mt-8 md:mt-10">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5">
            {communities.map((c) => {
              const initials = c.name
                .replace(/[^a-zA-Z0-9]/g, "")
                .slice(0, 3)
                .toUpperCase() || "FW";

              const cardContent = (
                <>
                  <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] shadow-[0_0_0_1px_rgba(148,163,184,0.04)] sm:h-[4.5rem] sm:w-[4.5rem] lg:h-20 lg:w-20">
                    {c.logoUrl ? (
                      <Image
                        src={c.logoUrl}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 64px, (max-width: 1024px) 72px, 80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] font-black tracking-[0.12em] text-[var(--fw-brand)] sm:text-xs">
                        {initials}
                      </div>
                    )}
                  </div>

                  <span className="max-w-[11rem] text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fw-text-primary)] sm:text-[11px]">
                    {c.name}
                  </span>

                  {c.websiteUrl ? (
                    <span className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-primary)] text-[var(--fw-brand)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-[var(--fw-brand)]">
                      <ArrowUpRight size={14} strokeWidth={2.2} />
                    </span>
                  ) : null}
                </>
              );

              const baseClasses =
                "community-card group flex min-h-[170px] flex-col items-center justify-center rounded-xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] px-3 py-4 text-center transition-all duration-200 ease-out";

              if (c.websiteUrl) {
                return (
                  <a
                    key={c.id}
                    href={c.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClasses} hover:-translate-y-1 hover:border-[var(--fw-brand)] hover:bg-[var(--fw-bg-surface-hover)]`}
                    aria-label={`Visit ${c.name} website`}
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
                <div key={c.id} className={`${baseClasses} bg-[var(--fw-bg-surface)]`}>
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}