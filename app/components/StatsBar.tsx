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
        // Reduced motion: just show final numbers, no animation
        valueRefs.current.forEach((el, i) => {
          if (el) el.textContent = `${items[i].value}${items[i].suffix}`;
        });
        return;
      }

      const cards = gsap.utils.toArray<HTMLElement>(".stat-card");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true, // fires once — no repeated re-trigger lag on scroll up/down
        },
      });

      // Card entrance
      tl.from(cards, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });

      // Number count-up, runs alongside card entrance
      items.forEach((item, i) => {
        const el = valueRefs.current[i];
        if (!el) return;

        const counter = { val: 0 };
        tl.to(
          counter,
          {
            val: item.value,
            duration: 1,
            ease: "power1.out",
            onUpdate: () => {
              el.textContent = `${Math.round(counter.val)}${item.suffix}`;
            },
          },
          "<0.1" // starts slightly after its card fades in
        );
      });

      return () => {
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [stats] }
  );

  return (
    <section ref={sectionRef} className="border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-8 sm:gap-4 sm:px-6 sm:py-10 sm:grid-cols-4">
        {items.map((stat, i) => (
          <div
            key={stat.label}
            className="stat-card card flex flex-col items-center justify-center gap-1.5 py-5 text-center sm:gap-2 sm:py-6"
          >
            <stat.icon className="text-gold" size={20} />
            <span
              ref={(el) => {
                valueRefs.current[i] = el;
              }}
              className="font-display text-2xl font-bold text-gold sm:text-3xl"
            >
              0{stat.suffix}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted sm:text-xs">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}