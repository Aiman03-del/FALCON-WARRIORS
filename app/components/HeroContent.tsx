"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowRight, UserCircle, Users } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroPrimaryButton from "./HeroPrimaryButton";
import HeroSecondaryButton from "./HeroSecondaryButton";

type HeroContentProps = {
  foundedYear: string | number;
  location: string;
  presidentName: string;
  managerName: string;
  primaryCta: { href: string; label: string; iconName: "userCircle" | "users" };
};

export default function HeroContent({
  foundedYear,
  location,
  presidentName,
  managerName,
  primaryCta,
}: HeroContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const PrimaryIcon = primaryCta.iconName === "userCircle" ? UserCircle : Users;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as {
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            gsap.set(
              [
                ".hero-eyebrow",
                ".hero-crest",
                ".hero-title",
                ".hero-tagline",
                ".hero-subtitle",
                ".hero-cta",
                ".hero-meta",
                ".hero-scroll",
              ],
              { opacity: 1, y: 0, clearProps: "transform" }
            );
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 0.7 },
          });

          tl.from(".hero-eyebrow", { opacity: 0, y: 20 }, 0)
            .from(".hero-crest", { opacity: 0, y: 20 }, 0.15)
            .from(".hero-title", { opacity: 0, y: 24 }, 0.4)
            .from(".hero-tagline", { opacity: 0, y: 16 }, 0.55)
            .from(".hero-subtitle", { opacity: 0, y: 16 }, 0.65)
            .from(".hero-cta", { opacity: 0, y: 18 }, 0.75)
            .from(".hero-meta", { opacity: 0, y: 12 }, 0.82)
            .from(".hero-scroll", { opacity: 0, y: 12 }, 0.9);

          return () => tl.kill();
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 pb-10 pt-12 text-center sm:px-6 md:pb-14"
    >
      <div className="hero-eyebrow mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fw-text-secondary)] sm:mb-6 sm:text-[11px] md:text-[12px]">
        EST. {foundedYear} • {location.toUpperCase()}
      </div>

      <div className="hero-crest relative mb-5 sm:mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] shadow-[0_0_36px_var(--fw-glow)] ring-1 ring-[var(--fw-border)] backdrop-blur-sm sm:h-28 sm:w-28 md:h-36 md:w-36">
          <Image
            src="/logo.jpg"
            alt="Falcon Warriors crest"
            width={160}
            height={160}
            className="h-full w-full rounded-full object-cover p-2"
            priority
          />
        </div>
      </div>

      <h1 className="hero-title flex flex-col text-[clamp(3rem,16vw,5rem)] font-black uppercase leading-[0.8] tracking-[-0.07em] text-[var(--fw-text-primary)] md:text-[clamp(4rem,9vw,8rem)]">
        <span className="block">FALCON</span>
        <span className="block text-[var(--fw-text-secondary)]">WARRIORS</span>
      </h1>

      <p className="hero-tagline mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--fw-text-secondary)] sm:mt-6 sm:text-[12px] md:text-[14px]">
        RISE. COMPETE. CONQUER.
      </p>

      <p className="hero-subtitle mt-4 max-w-[520px] text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-[15px]">
        Chittagong&apos;s competitive eFootball club.
      </p>

      <div className="hero-cta mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
        <HeroPrimaryButton
          href={primaryCta.href}
          className="w-full min-w-[180px] sm:w-auto"
        >
          <PrimaryIcon size={16} />
          <span>{primaryCta.label}</span>
          <ArrowRight size={16} className="sm:hidden" />
        </HeroPrimaryButton>

        <HeroSecondaryButton href="/matches" className="w-full min-w-[180px] sm:w-auto">
          <span>VIEW MATCHES</span>
        </HeroSecondaryButton>
      </div>

      <div className="hero-meta mt-6 flex w-full max-w-xl justify-center gap-8 text-left md:mt-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fw-text-muted)]">President</p>
          <p className="mt-1 text-sm font-medium text-[var(--fw-text-primary)]">{presidentName}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fw-text-muted)]">Manager</p>
          <p className="mt-1 text-sm font-medium text-[var(--fw-text-primary)]">{managerName}</p>
        </div>
      </div>

      <div className="hero-scroll mt-8 flex flex-col items-center gap-2 sm:mt-10">
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--fw-text-secondary)]">
          SCROLL TO EXPLORE
        </span>
        <div className="h-7 w-px overflow-hidden bg-[var(--fw-border)]">
          <div className="scroll-indicator h-full w-full rounded-full bg-gradient-to-b from-[var(--fw-text-primary)]/75 via-[var(--fw-text-primary)]/70 to-transparent animate-[hero-scroll_2.1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}