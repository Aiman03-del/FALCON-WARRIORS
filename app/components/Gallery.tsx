"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import FillButton from "./FillButton";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type GalleryItem = { id: string; image_url: string; caption: string | null };

export default function Gallery({ items }: { items: GalleryItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const displayItems =
    items.length > 0 ? items : [{ id: "fallback", image_url: "/logo.jpg", caption: "Falcon Warriors crest" }];

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".gallery-heading, .gallery-copy, .gallery-visual", {
        opacity: 0,
        y: 18,
        duration: 0.6, // fw-animation-reveal
        ease: "power2.out",
        stagger: 0.1, // standardized stagger
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 82%",
          once: true,
        },
      });

      if (visualRef.current) {
        gsap.from(".gallery-tile", {
          opacity: 0,
          scale: 0.97,
          duration: 0.6, // fw-animation-reveal
          ease: "power2.out",
          stagger: 0.1, // standardized stagger
          scrollTrigger: {
            trigger: visualRef.current,
            start: "top 88%",
            once: true,
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [items] }
  );

  const primaryImage = displayItems[0];
  const secondaryImages = displayItems.slice(1, 3);

  return (
    <section ref={sectionRef} className="border-b bg-[var(--fw-bg-primary)]" style={{ borderColor: 'var(--fw-border)' }}>
      <div className="fw-container fw-section">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="gallery-copy">
            <p className="gallery-heading mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--fw-brand)] sm:text-[11px]">
              WHO WE ARE
            </p>

            <h2 className="gallery-heading text-[clamp(2.6rem,5vw,5rem)] font-black uppercase leading-[0.94] tracking-[-0.06em] text-[var(--fw-text-primary)]">
              <span className="block">BUILT FOR THE</span>
              <span className="block text-[var(--fw-brand)]">BATTLE.</span>
            </h2>

            <p className="gallery-heading mt-5 max-w-[560px] text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-base">
              FALCON WARRIORS is more than a team. It&apos;s a competitive eFootball community built
              around discipline, passion, and the ambition to rise through every challenge.
            </p>

            <div className="gallery-heading mt-7">
              <FillButton
                href="/players"
                className="w-fit rounded-full px-5 py-3 text-[11px] uppercase tracking-[0.12em] sm:px-6 sm:text-xs"
              >
                <span>Explore The Club</span>
                <ArrowRight size={16} />
              </FillButton>
            </div>

            <div className="gallery-heading mt-8 grid max-w-md grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fw-text-muted)]">
                  CLUB
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--fw-text-primary)]">FALCON WARRIORS</p>
              </div>
              <div className="rounded-2xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fw-text-muted)]">
                  FOCUS
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--fw-text-primary)]">eFOOTBALL</p>
              </div>
            </div>
          </div>

          <div ref={visualRef} className="gallery-visual relative">
            <div className="absolute inset-x-10 top-8 h-28 rounded-full bg-[var(--fw-glow)] blur-3xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-3 shadow-[0_24px_80px_rgba(5,7,11,0.45)] backdrop-blur-sm sm:p-4">
              <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
                <div className="gallery-tile relative aspect-[4/5] overflow-hidden rounded-[24px] border border-[var(--fw-border)] bg-[var(--fw-bg-secondary)]">
                  <Image
                    src={primaryImage.image_url}
                    alt={primaryImage.caption ?? "Falcon Warriors club photo"}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,7,11,0.8)] via-transparent to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fw-text-primary)]">
                    <span>FALCON WARRIORS</span>
                    <span className="text-[var(--fw-brand)]">CLUB IDENTITY</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  {secondaryImages.length > 0 ? (
                    secondaryImages.map((item) => (
                      <div
                        key={item.id}
                        className="gallery-tile relative aspect-[4/3] overflow-hidden rounded-[22px] border border-[var(--fw-border)] bg-[var(--fw-bg-secondary)]"
                      >
                        <Image
                          src={item.image_url}
                          alt={item.caption ?? "Falcon Warriors identity image"}
                          fill
                          sizes="(max-width: 768px) 100vw, 30vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,7,11,0.78)] via-transparent to-transparent" />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="gallery-tile relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] border border-[var(--fw-border)] bg-[var(--fw-bg-secondary)] p-4">
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] shadow-[0_0_24px_var(--fw-glow)] sm:h-24 sm:w-24">
                          <Image
                            src="/logo.jpg"
                            alt="Falcon Warriors crest"
                            fill
                            className="rounded-full object-cover p-2"
                          />
                        </div>
                      </div>
                      <div className="gallery-tile flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] border border-[var(--fw-border)] bg-[var(--fw-bg-secondary)] px-4 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fw-text-secondary)]">
                          Discipline. Competition. Brotherhood.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
