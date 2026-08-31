'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, PlayCircle, Share2 } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface NavigationLink {
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
}

interface NavigationGroup {
  title: string;
  links: NavigationLink[];
}

interface FooterClientProps {
  logoUrl: string;
  navigationGroups: NavigationGroup[];
}

export default function FooterClient({ logoUrl, navigationGroups }: FooterClientProps) {
  const footerRef = useRef<HTMLDivElement>(null);
  const crestRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run animations if prefers-reduced-motion is not set
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReduced) {
      // Clear any GSAP transforms for reduced-motion users
      gsap.set([crestRef.current, headingRef.current, descriptionRef.current], { clearProps: 'all' });
   if (linksRef.current) {
  gsap.set(linksRef.current.querySelectorAll('[data-footer-link]'), { clearProps: 'all' });
}
      return;
    }

    const ctx = gsap.context(() => {
      if (!footerRef.current) return;

      gsap.from(crestRef.current, {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 20,
        duration: 0.6, // fw-animation-reveal
      });

      gsap.from(headingRef.current, {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 20,
        duration: 0.6, // fw-animation-reveal
        delay: 0.1,
      });

      gsap.from(descriptionRef.current, {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 20,
        duration: 0.6, // fw-animation-reveal
        delay: 0.15,
      });

      const linkElements = linksRef.current?.querySelectorAll('[data-footer-link]');
      if (linkElements && linkElements.length > 0) {
        gsap.from(linkElements, {
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 20,
          duration: 0.6, // fw-animation-reveal
          stagger: 0.08, // standardized stagger
          delay: 0.2,
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'discord':
        return MessageCircle;
      case 'youtube':
        return PlayCircle;
      case 'share':
        return Share2;
      default:
        return null;
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative border-t overflow-hidden overscroll-none"
      style={{
        borderTopColor: 'var(--fw-border)',
        backgroundColor: 'var(--fw-bg-surface)',
      }}
    >
      {/* Decorative crest watermark */}
      <div
        className="absolute -right-10 -bottom-16 md:-right-20 md:-bottom-32 w-56 md:w-96 opacity-[0.03] pointer-events-none"
        aria-hidden="true"
      >
        <Image
          src={logoUrl}
          alt=""
          width={400}
          height={400}
          className="w-full h-auto"
        />
      </div>

      <div className="fw-container py-16 md:py-24 relative z-10">
        {/* Brand section + Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 md:gap-12 mb-12">
          {/* Brand column */}
          <div className="flex flex-col gap-6">
            {/* Crest */}
            <div
              ref={crestRef}
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl border"
              style={{
                borderColor: 'var(--fw-border)',
                boxShadow: '0 0 24px var(--fw-glow)',
              }}
            >
              <Image
                src={logoUrl}
                alt="Falcon Warriors crest"
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Club name */}
            <div ref={headingRef}>
              <h2
                className="text-3xl md:text-4xl font-black tracking-tight"
                style={{
                  color: 'var(--fw-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                FALCON
                <br />
                WARRIORS
              </h2>
            </div>

            {/* Description */}
            <p
              ref={descriptionRef}
              className="text-xs md:text-sm leading-relaxed max-w-sm"
              style={{
                color: 'var(--fw-text-secondary)',
              }}
            >
              Elite eFootball community. Compete. Connect. Conquer. Join thousands of competitive gamers.
            </p>
          </div>

          {/* Navigation groups */}
          <div ref={linksRef} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-8 md:col-span-3">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                {/* Group heading */}
                <h3
                  className="text-xs md:text-sm font-bold uppercase mb-5 md:mb-6"
                  style={{
                    color: 'var(--fw-brand)',
                    letterSpacing: '0.14em',
                  }}
                >
                  {group.title}
                </h3>

                {/* Group links */}
                <ul className="space-y-2 md:space-y-3 flex flex-col">
                  {group.links.map((link, index) => {
                    const Icon = getIcon(link.icon);
                    const isIconLink = !!Icon;
                    const itemKey = `${group.title}-${link.label}-${link.href || 'item'}-${index}`;

                    return (
                      <li key={itemKey} data-footer-link>
                        {isIconLink ? (
                          <Link
                            href={link.href}
                            aria-label={link.label}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 hover:border-[var(--fw-brand)] hover:text-[var(--fw-brand)]"
                            style={{
                              borderColor: 'var(--fw-border)',
                              color: 'var(--fw-text-secondary)',
                            }}
                            onClick={(event) => {
                              if (link.href === '#') {
                                event.preventDefault();
                              }
                            }}
                            {...(link.external && {
                              target: '_blank',
                              rel: 'noopener noreferrer',
                            })}
                          >
                            {Icon && <Icon size={18} />}
                          </Link>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-xs md:text-sm transition-all duration-200 inline-block hover:text-[var(--fw-text-primary)] hover:translate-x-1"
                            style={{
                              color: 'var(--fw-text-secondary)',
                            }}
                            onClick={(event) => {
                              if (link.href === '#') {
                                event.preventDefault();
                              }
                            }}
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-8 md:my-12 h-px"
          style={{
            backgroundColor: 'var(--fw-border)',
          }}
        />

        {/* Copyright row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm">
          <p style={{ color: 'var(--fw-text-muted)' }}>
            © 2026 FALCON WARRIORS
          </p>
          <p style={{ color: 'var(--fw-text-muted)' }}>
            ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}
