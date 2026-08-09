"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const PARTICLE_COUNT = 10;

export default function HeroBackgroundAlt() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        ".spotlight-sweep",
        { xPercent: -130 },
        {
          xPercent: 130,
          duration: 7,
          ease: "power1.inOut",
          repeat: -1,
          repeatDelay: 1.5,
        }
      );

      gsap.utils.toArray<HTMLElement>(".light-particle").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 0, opacity: 0 },
          {
            y: -120 - Math.random() * 60,
            opacity: 0.6,
            duration: 4 + Math.random() * 3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.4,
          }
        );
      });

      gsap.to(".pitch-grid", {
        opacity: 0.35,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden [perspective:600px]">
      <div
        className="pitch-grid absolute inset-x-0 bottom-0 h-1/2 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-gold, #D4AF37) 0px, var(--color-gold, #D4AF37) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, var(--color-gold, #D4AF37) 0px, var(--color-gold, #D4AF37) 1px, transparent 1px, transparent 48px)",
          transform: "rotateX(62deg)",
          transformOrigin: "bottom",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />

      <div
        className="spotlight-sweep absolute -top-1/4 left-1/2 h-[160%] w-40 -translate-x-1/2 sm:w-64"
        style={{
          background:
            "linear-gradient(100deg, transparent, var(--color-gold, #D4AF37) 50%, transparent)",
          opacity: 0.06,
          transform: "rotate(18deg)",
        }}
      />

      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <span
          key={i}
          className="light-particle absolute h-1 w-1 rounded-full bg-gold"
          style={{
            left: `${8 + ((i * 97) % 84)}%`,
            bottom: `${5 + ((i * 53) % 30)}%`,
          }}
        />
      ))}

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
    </div>
  );
}
