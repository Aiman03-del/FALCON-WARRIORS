"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function HeroBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Two floodlight glows drift slowly and pulse — pure transform/opacity, GPU-cheap
      gsap.to(".glow-a", {
        x: 40,
        y: -20,
        opacity: 0.9,
        duration: 8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(".glow-b", {
        x: -35,
        y: 25,
        opacity: 0.7,
        duration: 10,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.5,
      });

      // Corner accent lines draw in once on load
      gsap.from(".corner-accent", {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out",
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dot-grid texture — subtle, static, pure CSS (no animation cost) */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(var(--color-gold, #D4AF37) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 90%)",
        }}
      />

      {/* Pitch markings — kept from before */}
      <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-gold/10" />
      <div className="absolute left-1/2 top-1/2 h-55 w-55 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 sm:h-90 sm:w-90" />
      <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20" />

      {/* Drifting floodlight glows */}
      <div className="glow-a absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
      <div className="glow-b absolute right-1/4 bottom-0 h-80 w-80 translate-x-1/2 rounded-full bg-gold/8 blur-[110px]" />

      {/* Corner accent brackets — stadium-scoreboard feel */}
      <div className="corner-accent absolute left-4 top-4 h-8 w-8 border-l border-t border-gold/25 sm:left-8 sm:top-8 sm:h-12 sm:w-12" />
      <div className="corner-accent absolute right-4 top-4 h-8 w-8 border-r border-t border-gold/25 sm:right-8 sm:top-8 sm:h-12 sm:w-12" />
      <div className="corner-accent absolute bottom-4 left-4 h-8 w-8 border-b border-l border-gold/25 sm:bottom-8 sm:left-8 sm:h-12 sm:w-12" />
      <div className="corner-accent absolute bottom-4 right-4 h-8 w-8 border-b border-r border-gold/25 sm:bottom-8 sm:right-8 sm:h-12 sm:w-12" />
    </div>
  );
}