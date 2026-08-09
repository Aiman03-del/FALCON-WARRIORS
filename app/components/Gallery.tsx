"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type GalleryItem = { id: string; image_url: string; caption: string | null };

export default function Gallery({ items }: { items: GalleryItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Heading fade-in
      gsap.from(".gallery-heading", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      });

      // Photo grid pop-in
      if (gridRef.current) {
        const tiles = gsap.utils.toArray<HTMLElement>(".gallery-tile", gridRef.current);
        if (tiles.length > 0) {
          gsap.from(tiles, {
            opacity: 0,
            scale: 0.9,
            duration: 0.45,
            ease: "power2.out",
            stagger: {
              amount: Math.min(tiles.length * 0.06, 0.8), // caps total stagger time even with many photos
              grid: "auto",
              from: "start",
            },
            clearProps: "transform",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 88%",
              once: true,
            },
          });
        }
      }
    },
    { scope: sectionRef, dependencies: [items] }
  );

  return (
    <section ref={sectionRef} className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-14">
        <div className="gallery-heading">
          <div className="section-divider mx-auto" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
            Match Gallery
          </h2>
          <p className="mt-2 text-sm text-muted">
            Iconic moments from our most intense battles.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No photos uploaded yet.</p>
        ) : (
          <div
            ref={gridRef}
            className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="gallery-tile relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-2 sm:rounded-xl"
              >
                <Image
                  src={item.image_url}
                  alt={item.caption ?? "Falcon Warriors gallery photo"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}