"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type NewsItem = {
  id: string;
  category: string;
  title: string;
  date: string;
  imageUrl: string | null;
};

function isSafeImageSrc(src: string | null | undefined) {
  if (!src) return false;
  const value = src.trim();
  if (!value) return false;
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

export default function LatestNews({ news }: { news: NewsItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const featuredItem = news[0];
  const secondaryItems = news.slice(1, 3);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(".news-card");
      if (cards.length === 0) return;

      gsap.from(cards, {
        opacity: 0,
        y: 24,
        duration: 0.6, // fw-animation-reveal
        ease: "power2.out",
        stagger: 0.1, // standardized stagger
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 88%",
          once: true,
        },
      });
    },
    { scope: gridRef, dependencies: [news] }
  );

  return (
    <section className="relative border-b bg-[var(--fw-bg-primary)]" style={{ borderColor: 'var(--fw-border)' }}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom_right,rgba(91,117,255,0.12),transparent_48%)]" />

      <div className="relative fw-container fw-section">
        <div className="mb-7 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--fw-brand)] sm:text-[11px]">
              LATEST NEWS
            </p>
            <h2 className="font-display text-3xl font-black uppercase tracking-[-0.04em] text-[var(--fw-text-primary)] sm:text-4xl lg:text-[2.9rem]">
              LATEST FROM THE WARRIORS
            </h2>
            <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-[var(--fw-text-secondary)] sm:text-base">
              The latest stories, announcements and moments from FALCON WARRIORS.
            </p>
          </div>

          <Link
            href="/news"
            className="inline-flex items-center gap-2 self-start text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--fw-text-primary)] transition-colors duration-200 hover:text-[var(--fw-brand)] md:self-end"
          >
            View all news <span aria-hidden="true">→</span>
          </Link>
        </div>

        {news.length === 0 ? (
          <div className="rounded-2xl border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-6 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--fw-text-primary)]">
              No news yet
            </p>
            <p className="mt-2 text-sm text-[var(--fw-text-secondary)]">
              New stories from the Warriors will appear here.
            </p>
          </div>
        ) : (
          <div ref={gridRef} className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <Link
              href={`/news/${featuredItem.id}`}
              className="news-card group relative overflow-hidden rounded-fw-lg border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--fw-brand)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {isSafeImageSrc(featuredItem.imageUrl) ? (
                  <Image
                    src={featuredItem.imageUrl as string}
                    alt={featuredItem.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(91,117,255,0.32),transparent_46%),linear-gradient(135deg,rgba(11,18,28,0.96),rgba(5,7,11,0.8))]" />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,7,11,0.85),rgba(5,7,11,0.18)_50%,transparent)]" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-7">
                  <span className="inline-flex rounded-full border border-[var(--fw-border)] bg-[var(--fw-brand-soft)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--fw-brand)]">
                    {featuredItem.category}
                  </span>

                  <h3 className="mt-4 max-w-xl text-2xl font-black uppercase leading-[1.08] tracking-[-0.04em] text-[var(--fw-text-primary)] sm:text-3xl lg:text-[2.2rem]">
                    {featuredItem.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fw-text-secondary)] sm:text-[11px]">
                    <span>{featuredItem.date}</span>
                    <span className="inline-flex items-center gap-1 text-[var(--fw-brand)]">
                      Read story <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {secondaryItems.map((n) => (
                <Link
                  key={n.id}
                  href={`/news/${n.id}`}
                  className="news-card group overflow-hidden rounded-fw-lg border border-[var(--fw-border)] bg-[var(--fw-bg-surface)] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--fw-brand)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                    {isSafeImageSrc(n.imageUrl) ? (
                      <Image
                        src={n.imageUrl as string}
                        alt={n.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(91,117,255,0.28),transparent_52%),linear-gradient(135deg,rgba(11,18,28,0.96),rgba(5,7,11,0.8))]" />
                    )}
                  </div>

                  <div className="pt-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--fw-brand)]">
                      {n.category}
                    </span>
                    <h3 className="mt-2 text-lg font-bold leading-snug text-[var(--fw-text-primary)] group-hover:text-[var(--fw-brand)]">
                      {n.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fw-text-muted)]">
                      <span>{n.date}</span>
                      <span className="inline-flex items-center gap-1 text-[var(--fw-brand)]">
                        Read <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}