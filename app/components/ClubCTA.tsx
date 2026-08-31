"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import FillButton from "./FillButton";
import OutlineButton from "./OutlineButton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ClubCTA() {
const sectionRef = useRef<HTMLElement>(null);   
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !panelRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(
        ".cta-crest, .cta-heading, .cta-description, .cta-buttons",
        {
          opacity: 0,
          y: 20,
          duration: 0.6, // fw-animation-reveal
          ease: "power2.out",
          stagger: 0.1, // standardized stagger
          scrollTrigger: {
            trigger: panelRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      ref={sectionRef}
      className="border-b bg-[var(--fw-bg-primary)]"
      style={{ borderColor: 'var(--fw-border)' }}
    >
      <div className="fw-container fw-section">
        <div
          ref={panelRef}
          className="relative overflow-hidden rounded-[32px] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] px-6 py-20 text-center shadow-[0_24px_80px_rgba(5,7,11,0.45)] backdrop-blur-sm sm:px-8 sm:py-28 lg:px-12"
        >
          {/* Decorative glow effects */}
          <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-[var(--fw-glow)] blur-[120px] opacity-30" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[var(--fw-glow)] blur-[100px] opacity-20" />

          {/* Decorative background text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <p className="text-[12vw] font-black uppercase leading-none text-[var(--fw-text-primary)] opacity-[0.04] select-none">
              WARRIORS
            </p>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Eyebrow */}
            <p className="cta-crest mb-6 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--fw-brand)] sm:text-[11px]">
              JOIN THE COMMUNITY
            </p>

            {/* Crest visual */}
            <div className="cta-crest mb-8 flex justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-secondary)] shadow-[0_0_32px_var(--fw-glow)] sm:h-28 sm:w-28">
                <Image
                  src="/logo.jpg"
                  alt="Falcon Warriors crest"
                  fill
                  className="rounded-full object-cover p-1.5 sm:p-2"
                />
              </div>
            </div>

            {/* Main heading */}
            <h2 className="cta-heading mb-6 text-[clamp(2.8rem,7vw,5rem)] font-black uppercase leading-[0.92] tracking-[-0.06em] text-[var(--fw-text-primary)]">
              <span className="block">JOIN THE</span>
              <span className="block text-[var(--fw-brand)]">WARRIORS</span>
            </h2>

            {/* Description */}
            <p className="cta-description mx-auto mb-10 max-w-[600px] text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-base">
              Become part of the FALCON WARRIORS community and follow the journey beyond the pitch.
            </p>

            {/* CTA Buttons */}
            <div className="cta-buttons flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <FillButton
                href="/register"
                className="w-full rounded-full px-7 py-3 text-[11px] uppercase tracking-[0.12em] sm:w-auto sm:px-8"
              >
                <span>Join The Club</span>
                <ArrowRight size={16} />
              </FillButton>

              <OutlineButton
                href="/players"
                className="w-full rounded-full px-7 py-3 text-[11px] uppercase tracking-[0.12em] sm:w-auto sm:px-8"
              >
                <span>Explore Team</span>
                <ArrowRight size={16} />
              </OutlineButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

