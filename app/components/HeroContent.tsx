"use client";

import { useRef } from "react";
import { ArrowRight, Calendar, Crown, ExternalLink, MapPin, UserCog, UserCircle, Users } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import FillButton from "./FillButton";
import OutlineButton from "./OutlineButton";
import { FaFacebook } from "react-icons/fa";

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

  const infoItems = [
    { icon: Calendar, label: "Founded", value: foundedYear },
    { icon: MapPin, label: "Location", value: location },
    { icon: Crown, label: "President", value: presidentName },
    { icon: UserCog, label: "Manager", value: managerName },
  ];

  useGSAP(
    () => {
      // matchMedia: respects reduced-motion + gives mobile a lighter, faster animation
      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: "(max-width: 639px)",
          isDesktop: "(min-width: 640px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion, isMobile } = context.conditions as {
            reduceMotion: boolean;
            isMobile: boolean;
          };

          if (reduceMotion) {
            // No motion: just make sure everything is visible, no animation at all
            gsap.set(
              [".hero-ticker", ".hero-headline", ".hero-tagline", ".hero-cta", ".hero-info-strip"],
              { opacity: 1, y: 0, clearProps: "transform" }
            );
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: isMobile ? 0.5 : 0.7 },
          });

          tl.from(".hero-ticker", { opacity: 0, y: -12 })
            .from(
              ".hero-headline",
              { opacity: 0, y: isMobile ? 20 : 32, duration: isMobile ? 0.6 : 0.9 },
              "-=0.2"
            )
            .from(".hero-tagline", { opacity: 0, y: 16 }, "-=0.45")
            .from(".hero-cta", { opacity: 0, y: 16, stagger: 0.08 }, "-=0.4")
            .from(
              ".hero-info-strip",
              { opacity: 0, y: isMobile ? 16 : 24 },
              "-=0.3"
            )
            .from(
              ".hero-info-item",
              { opacity: 0, y: 10, stagger: 0.06 },
              "-=0.35"
            );

          return () => tl.kill();
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-10 text-center sm:px-6">
      {/* Match-day ticker */}
      <div className="hero-ticker mb-4 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted sm:mb-6 sm:text-xs">
        <span className="text-gold">●</span>
        <span>Est. {foundedYear}</span>
        <span className="text-gold/40">/</span>
        <span>Elite eFootball Division</span>
      </div>

      {/* Headline with ghost squad number signature */}
      <div className="relative flex flex-col items-center">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-4 select-none font-display text-[5rem] font-black leading-none text-transparent sm:-top-6 sm:text-[7.5rem] md:text-[8.5rem]"
          style={{ WebkitTextStroke: "1.5px var(--color-gold, #D4AF37)", opacity: 0.15 }}
        >
          07
        </span>

        <h1 className="hero-headline relative font-display text-4xl font-bold uppercase leading-[0.95] tracking-wide text-white sm:text-5xl md:text-7xl">
          Falcon
          <br />
          <span className="text-gold">Warriors</span>
        </h1>

        <p className="hero-tagline relative mt-3 max-w-md px-2 text-xs text-muted sm:mt-4 sm:text-sm md:text-base">
          Rise. Compete. Conquer. The new era of eFootball dominance begins
          here.
        </p>

        <div className="relative mt-5 flex w-full max-w-105 flex-col gap-2.5 sm:mt-6 sm:flex-row sm:justify-center">
          <FillButton href={primaryCta.href} className="hero-cta w-full sm:w-auto">
            <PrimaryIcon size={16} />
            <span>{primaryCta.label}</span>
            <ArrowRight size={16} className="sm:hidden" />
          </FillButton>
          <OutlineButton
            href="https://www.facebook.com/profile.php?id=61579023831850"
            className="hero-cta w-full gap-2 sm:w-auto"
          >
            <FaFacebook size={16} />
            <span>Facebook</span>
            <ExternalLink size={14} className="sm:hidden" />
          </OutlineButton>
        </div>
      </div>

      {/* Match info strip — scoreboard style, spans full width */}
      <div className="hero-info-strip relative mt-10 w-full sm:mt-14">
        <div className="grid grid-cols-2 divide-y divide-gold/15 overflow-hidden rounded-xl border border-gold/20 bg-surface/40 backdrop-blur-sm sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:divide-gold/15">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="hero-info-item flex flex-col items-center gap-1.5 px-3 py-4 transition-colors hover:bg-gold/5 sm:py-5"
            >
              <Icon size={16} className="text-gold" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted sm:text-[10px]">
                {label}
              </p>
              <p className="max-w-36 truncate font-mono text-sm font-bold text-white sm:text-base">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}