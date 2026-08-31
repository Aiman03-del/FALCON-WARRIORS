"use client";

import { useEffect, useRef } from "react";
import { Trophy } from "lucide-react";
import gsap from "gsap";

type Achievement = { id: string; label: string };

type MarqueeDirection = "left" | "right";

const SPEED_PX_PER_SEC = 42;

export default function AchievementsTicker({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tweenRefs = useRef<Array<gsap.core.Tween | null>>([]);

  useEffect(() => {
    if (achievements.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows: Array<{ ref: HTMLDivElement | null; direction: MarqueeDirection }> = [
      { ref: trackRefs.current[0], direction: "left" },
      { ref: trackRefs.current[1], direction: "right" },
    ];

    const cleanup = rows.map((row, index) => {
      const track = row.ref;
      if (!track) return null;

      const buildTween = () => {
        tweenRefs.current[index]?.kill();
        gsap.set(track, { xPercent: 0 });

        const singleSetWidth = track.scrollWidth / 2;
        const duration = singleSetWidth / SPEED_PX_PER_SEC;

        const endValue = row.direction === "left" ? -50 : 50;
        tweenRefs.current[index] = gsap.to(track, {
          xPercent: endValue,
          duration,
          ease: "none",
          repeat: -1,
          yoyo: row.direction === "right",
          repeatRefresh: true,
        });
      };

      buildTween();

      let resizeTimeout: ReturnType<typeof setTimeout>;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(buildTween, 150);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimeout);
        tweenRefs.current[index]?.kill();
      };
    });

    return () => {
      cleanup.forEach((fn) => fn?.());
    };
  }, [achievements]);

  if (achievements.length === 0) return null;

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderTrack = (direction: MarqueeDirection) => {
    const isRight = direction === "right";

    return (
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => {
          if (typeof window === "undefined") return;
          tweenRefs.current.forEach((t) => t?.pause());
        }}
        onMouseLeave={() => {
          if (typeof window === "undefined") return;
          tweenRefs.current.forEach((t) => t?.play());
        }}
      >
        <div
          ref={(node) => {
            const index = isRight ? 1 : 0;
            trackRefs.current[index] = node;
          }}
          className="flex w-max items-center gap-4 whitespace-nowrap"
          style={{
            transform: isRight ? "translate3d(0,0,0)" : "translate3d(0,0,0)",
          }}
        >
          {[...achievements, ...achievements].map((achievement, index) => (
            <div
              key={`${direction}-${achievement.id}-${index}`}
              className="flex shrink-0 items-center gap-2.5 px-4 sm:px-5"
            >
              <Trophy className="text-[var(--fw-brand)]" size={18} />
              <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--fw-text-primary)] sm:text-[12px]">
                {achievement.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (reduceMotion) {
    return (
      <section className="border-b bg-[var(--fw-bg-primary)]" style={{ borderColor: 'var(--fw-border)' }}>
        <div className="fw-container fw-section">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--fw-brand)] sm:text-[11px]">
              OUR ACHIEVEMENTS
            </p>
            <h2 className="font-display text-3xl font-black uppercase tracking-[-0.04em] text-[var(--fw-text-primary)] sm:text-4xl lg:text-[2.9rem]">
              PROVEN ON THE PITCH
            </h2>
            <p className="mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-base">
              Every match, every milestone, every step forward.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {[...achievements, ...achievements].map((achievement, index) => (
                  <div
                    key={`static-row-1-${achievement.id}-${index}`}
                    className="flex items-center gap-2 rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-primary)] px-3 py-2"
                  >
                    <Trophy className="text-[var(--fw-brand)]" size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fw-text-primary)]">
                      {achievement.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b bg-[var(--fw-bg-primary)]" style={{ borderColor: 'var(--fw-border)' }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_center,rgba(91,117,255,0.1),transparent_60%)]" />

      <div className="relative fw-container fw-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--fw-brand)] sm:text-[11px]">
            OUR ACHIEVEMENTS
          </p>
          <h2 className="font-display text-3xl font-black uppercase tracking-[-0.04em] text-[var(--fw-text-primary)] sm:text-4xl lg:text-[2.9rem]">
            PROVEN ON THE PITCH
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-base">
            Every match, every milestone, every step forward.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-3 sm:p-4">
          <div className="space-y-3">
            <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex h-[58px] items-center sm:h-[64px]">{renderTrack("left")}</div>
            </div>

            <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex h-[58px] items-center sm:h-[64px]">{renderTrack("right")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}