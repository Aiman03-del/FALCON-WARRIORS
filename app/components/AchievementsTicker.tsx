"use client";

import { useEffect, useRef } from "react";
import { Trophy } from "lucide-react";
import gsap from "gsap";

type Achievement = { id: string; label: string };

const SPEED_PX_PER_SEC = 45; // constant speed regardless of screen width

export default function AchievementsTicker({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (achievements.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const track = trackRef.current;
    if (!track) return;

    function buildTween() {
      tweenRef.current?.kill();
      gsap.set(track, { xPercent: 0 });

      // Half the width because content is duplicated once (two copies back-to-back)
      const singleSetWidth = track!.scrollWidth / 2;
      const duration = singleSetWidth / SPEED_PX_PER_SEC;

      tweenRef.current = gsap.to(track, {
        xPercent: -50,
        duration,
        ease: "none",
        repeat: -1,
      });
    }

    buildTween();

    // Recalculate speed on resize/orientation change so it stays constant
    let resizeTimeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(buildTween, 200);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      tweenRef.current?.kill();
    };
  }, [achievements]);

  if (achievements.length === 0) return null;

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fallback: static centered wrap layout (no motion / no JS)
  if (reduceMotion) {
    return (
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-3 sm:px-4 md:px-6 py-6">
          {achievements.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <Trophy className="text-gold" size={18} />
              <span className="font-display text-sm font-bold uppercase tracking-wide text-white/90">
                {a.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const AchievementItem = ({ a, dupKey }: { a: Achievement; dupKey: string }) => (
    <div key={dupKey} className="flex shrink-0 items-center gap-2 px-5">
      <Trophy className="text-gold" size={18} />
      <span className="font-display text-sm font-bold uppercase tracking-wide text-white/90 whitespace-nowrap">
        {a.label}
      </span>
    </div>
  );

  return (
    <section className="border-b border-border bg-surface overflow-hidden">
      <div
        className="group relative w-full py-6 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
        onMouseEnter={() => tweenRef.current?.pause()}
        onMouseLeave={() => tweenRef.current?.play()}
      >
        <div ref={trackRef} className="flex w-max items-center">
          {/* First copy */}
          {achievements.map((a) => (
            <AchievementItem key={`a-${a.id}`} a={a} dupKey={`a-${a.id}`} />
          ))}
          {/* Duplicate copy — needed for the seamless -50% loop */}
          {achievements.map((a) => (
            <AchievementItem key={`b-${a.id}`} a={a} dupKey={`b-${a.id}`} />
          ))}
        </div>
      </div>
    </section>
  );
}