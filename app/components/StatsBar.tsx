"use client";

import { useRef } from "react";
import { Users, Gamepad2, Trophy, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type StatsBarProps = {
  stats: {
    members: number;
    matches: number;
    trophies: number;
    winRate: number;
  };
};

export default function StatsBar({ stats }: StatsBarProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const items = [
    { label: "Members", value: stats.members, suffix: "+", icon: Users },
    { label: "Matches", value: stats.matches, suffix: "+", icon: Gamepad2 },
    { label: "Trophies", value: stats.trophies, suffix: "", icon: Trophy },
    { label: "Win Rate", value: stats.winRate, suffix: "%", icon: TrendingUp },
  ];

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        valueRefs.current.forEach((el, i) => {
          if (el) el.textContent = `${items[i].value}${items[i].suffix}`;
        });
        gsap.set(".stat-card", { opacity: 1, y: 0 });
        return;
      }

      const cards = gsap.utils.toArray<HTMLElement>(".stat-card");
      const panel = sectionRef.current?.querySelector<HTMLElement>(".stats-panel");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      });

      tl.from(panel, {
        opacity: 0,
        y: 20,
        duration: 0.6, // fw-animation-reveal
        ease: "power3.out",
      })
        .from(
          cards,
          {
            opacity: 0,
            y: 18,
            duration: 0.6, // fw-animation-reveal
            stagger: 0.1, // standardized stagger
            ease: "power3.out",
          },
          "-=0.35"
        );

      items.forEach((item, i) => {
        const el = valueRefs.current[i];
        if (!el) return;

        const counter = { val: 0 };
        tl.to(
          counter,
          {
            val: item.value,
            duration: 1.1, // extended for number counting
            ease: "power1.out",
            onUpdate: () => {
              el.textContent = `${Math.round(counter.val)}${item.suffix}`;
            },
          },
          `-=${i === 0 ? 0.2 : 0.1}`
        );
      });

      return () => {
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [stats] }
  );

  return (
    <section ref={sectionRef} className="border-b bg-[var(--fw-bg-primary)]" style={{ borderColor: 'var(--fw-border)' }}>
      <div className="fw-container fw-section">
        <div className="stats-panel overflow-hidden rounded-xl border border-[var(--fw-border)] bg-[var(--fw-bg-secondary)]/40">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {items.map((stat, i) => (
              <div
                key={stat.label}
                className={`stat-card relative flex flex-col items-center justify-center gap-2 border-b border-[var(--fw-border)] py-5 text-center sm:py-6 ${
                  i % 2 === 1 ? "border-l border-[var(--fw-border)] md:border-l-0" : ""
                } ${i < items.length - 2 ? "md:border-b-0" : ""} ${
                  i !== items.length - 1 ? "md:border-r md:border-[var(--fw-border)]" : ""
                }`}
              >
                <stat.icon className="text-[var(--fw-brand)]" size={18} />
                <span
                  ref={(el) => {
                    valueRefs.current[i] = el;
                  }}
                  className="font-display text-[clamp(1.75rem,3vw,3rem)] font-black leading-none text-[var(--fw-text-primary)]"
                >
                  0{stat.suffix}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fw-text-muted)] sm:text-[11px]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}