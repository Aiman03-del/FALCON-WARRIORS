import FillButton from "@/app/components/FillButton";
import OutlineButton from "@/app/components/OutlineButton";
import Link from "next/link";
import { Home, Users, Gamepad2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/8 blur-[140px]" />
      <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-indigo/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-gold/8 blur-[100px]" />

      {/* Hero grid pattern */}
      <div className="absolute inset-0 bg-hero-grid bg-[size:40px_40px] opacity-20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 404 number */}
        <div className="relative select-none">
          <span className="font-display text-[120px] font-bold leading-none text-white/5 sm:text-[180px] md:text-[220px]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[80px] font-bold leading-none text-gold/20 blur-sm sm:text-[120px] md:text-[160px]">
              404
            </span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Gamepad2 className="text-gold/60" size={36} />
            <span className="font-display text-4xl font-bold text-gold sm:text-5xl md:text-6xl">
              404
            </span>
          </div>
        </div>

        {/* Badge */}
        <span className="mt-6 rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-gold">
          PAGE NOT FOUND
        </span>

        {/* Heading */}
        <h1 className="mt-5 font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl md:text-4xl">
          Looks like you took a wrong turn
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          This page doesn&apos;t exist or has been moved. Head back to the pitch and keep playing.
        </p>

        {/* Divider line */}
        <div className="my-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <FillButton href="/" className="flex items-center gap-2">
            <Home size={15} />
            Back to Home
          </FillButton>
          <OutlineButton href="/players" className="flex items-center gap-2">
            <Users size={15} />
            View Roster
          </OutlineButton>
        </div>

        {/* Quick links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
          {[
            { label: "Matches", href: "/matches" },
            { label: "Tournaments", href: "/tournaments" },
            { label: "Achievements", href: "/achievements" },
            { label: "News", href: "/news" },
            { label: "Login", href: "/login" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
