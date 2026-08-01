import { ArrowRight, Calendar, Crown, ExternalLink, MapPin, UserCog, UserCircle, Users } from 'lucide-react';
import FillButton from "./FillButton";
import OutlineButton from "./OutlineButton";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import { createClient } from "@/app/lib/supabase/server";
import { FaFacebook } from 'react-icons/fa';

export default async function Hero() {
  const { foundedYear, location, presidentName, managerName } = await getSiteSettings();

  // লগইন করা থাকলে "Join the Club"-এর বদলে "My Profile" দেখাবে
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryCta = user
    ? { href: "/profile", label: "My Profile", icon: UserCircle }
    : { href: "/register", label: "Join the Club", icon: Users };

  const infoItems = [
    { icon: Calendar, label: "Founded", value: foundedYear },
    { icon: MapPin, label: "Location", value: location },
    { icon: Crown, label: "President", value: presidentName },
    { icon: UserCog, label: "Manager", value: managerName },
  ];

  return (
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden border-b border-border bg-background">
      {/* Pitch markings — center circle + halfway line */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-gold/10" />
        <div className="absolute left-1/2 top-1/2 h-55 w-55 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 sm:h-90 sm:w-90" />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20" />
      </div>
      <div className="absolute left-1/2 top-0 h-75 w-125 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-10 text-center sm:px-6">
        {/* Match-day ticker */}
        <div className="mb-4 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted sm:mb-6 sm:text-xs">
          <span className="text-gold">●</span>
          <span>Est. {foundedYear}</span>
          <span className="text-gold/40">/</span>
          <span>Elite eFootball Division</span>
        </div>

        {/* Headline with ghost squad number signature */}
        <div className="relative flex flex-col items-center">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-4 select-none font-display text-[5rem] font-black leading-none text-transparent sm:-top-6 sm:text-[7.5rem] md:text-[8.5rem]"
            style={{ WebkitTextStroke: "1.5px var(--color-gold, #D4AF37)", opacity: 0.15 }}
          >
            07
          </span>

          <h1 className="relative font-display text-4xl font-bold uppercase leading-[0.95] tracking-wide text-white sm:text-5xl md:text-7xl">
            Falcon
            <br />
            <span className="text-gold">Warriors</span>
          </h1>

          <p className="relative mt-3 max-w-md px-2 text-xs text-muted sm:mt-4 sm:text-sm md:text-base">
            Rise. Compete. Conquer. The new era of eFootball dominance begins
            here.
          </p>

          <div className="relative mt-5 flex w-full max-w-105 flex-col gap-2.5 sm:mt-6 sm:flex-row sm:justify-center">
            <FillButton href={primaryCta.href} className="w-full sm:w-auto">
              <primaryCta.icon size={16} />
              <span>{primaryCta.label}</span>
              <ArrowRight size={16} className="sm:hidden" />
            </FillButton>
            <OutlineButton
              href="https://www.facebook.com/profile.php?id=61579023831850"
              className="w-full gap-2 sm:w-auto"
            >
              <FaFacebook size={16} />
              <span>Facebook</span>
              <ExternalLink size={14} className="sm:hidden" />
            </OutlineButton>
          </div>
        </div>

        {/* Match info strip — scoreboard style, spans full width */}
        <div className="relative mt-10 w-full sm:mt-14">
          <div className="grid grid-cols-2 divide-y divide-gold/15 overflow-hidden rounded-xl border border-gold/20 bg-surface/40 backdrop-blur-sm sm:grid-cols-4 sm:divide-y-0 sm:divide-x sm:divide-gold/15">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 px-3 py-4 transition-colors hover:bg-gold/5 sm:py-5"
              >
                <Icon size={16} className="text-gold" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted sm:text-[10px]">
                  {label}
                </p>
                <p className="max-w-36 truncate font-mono text-sm font-bold text-white sm:text-base">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}