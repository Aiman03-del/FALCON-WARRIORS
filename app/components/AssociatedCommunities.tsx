"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AssociatedCommunity } from "../lib/queries/communities";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AssociatedCommunities({
  communities,
}: {
  communities: AssociatedCommunity[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const logos = gsap.utils.toArray<HTMLElement>(".community-logo", containerRef.current);
      if (logos.length === 0) return;

      gsap.from(logos, {
        opacity: 0,
        y: 14,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.06,
        clearProps: "transform",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          once: true,
        },
      });
    },
    { scope: containerRef, dependencies: [communities] }
  );

  if (communities.length === 0) return null;

  return (
    <div ref={containerRef} className="mx-auto max-w-5xl px-6 py-8">
      <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-muted">
        Associated Communities
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {communities.map((c) => {
          const content = (
            <div className="community-logo flex flex-col items-center gap-2 opacity-80 transition hover:opacity-100">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-2 sm:h-14 sm:w-14">
                {c.logoUrl ? (
                  <Image src={c.logoUrl} alt={c.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gold">
                    {c.name.slice(0, 4).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-white">
                {c.name}
              </span>
            </div>
          );

          return c.websiteUrl ? (
            <a key={c.id} href={c.websiteUrl} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <div key={c.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}