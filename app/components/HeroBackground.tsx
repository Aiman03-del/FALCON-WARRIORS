"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function HeroBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.to(".glow-a", {
        x: 40,
        y: -18,
        opacity: 0.9,
        duration: 8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(".glow-b", {
        x: -32,
        y: 18,
        opacity: 0.7,
        duration: 10,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.5,
      });

      gsap.from(".corner-accent", {
        opacity: 0,
        scale: 0.82,
        duration: 1,
        stagger: 0.12,
        ease: "power2.out",
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1.1px, transparent 1.1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 42%, black 45%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 42%, black 45%, transparent 90%)",
        }}
      />

      <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-[var(--fw-text-primary)]/5" />
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--fw-border)] sm:h-56 sm:w-56 md:h-80 md:w-80" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--fw-text-primary)]/20" />

      <div className="glow-a absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--fw-glow)] blur-[120px] sm:h-96 sm:w-96" />
      <div className="glow-b absolute right-1/4 bottom-0 h-64 w-64 translate-x-1/2 rounded-full bg-[var(--fw-glow-soft)] blur-[110px] sm:h-80 sm:w-80" />

      <div className="corner-accent absolute left-4 top-4 h-8 w-8 border-l border-t border-[var(--fw-border)] sm:left-8 sm:top-8 sm:h-12 sm:w-12" />
      <div className="corner-accent absolute right-4 top-4 h-8 w-8 border-r border-t border-[var(--fw-border)] sm:right-8 sm:top-8 sm:h-12 sm:w-12" />
      <div className="corner-accent absolute bottom-4 left-4 h-8 w-8 border-b border-l border-[var(--fw-border)] sm:bottom-8 sm:left-8 sm:h-12 sm:w-12" />
      <div className="corner-accent absolute bottom-4 right-4 h-8 w-8 border-b border-r border-[var(--fw-border)] sm:bottom-8 sm:right-8 sm:h-12 sm:w-12" />
    </div>
  );
}