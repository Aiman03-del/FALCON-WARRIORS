import { Calendar, Crown, MapPin, UserCog } from 'lucide-react';
import FillButton from "./FillButton";
import OutlineButton from "./OutlineButton";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";

export default async function Hero() {
  const { foundedYear, location, presidentName, managerName } = await getSiteSettings();

  const infoItems = [
    { icon: Calendar, label: "Founded", value: foundedYear },
    { icon: MapPin, label: "Location", value: location },
    { icon: Crown, label: "President", value: presidentName },
    { icon: UserCog, label: "Manager", value: managerName },
  ];

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden border-b border-border bg-background">
      {/* Pitch markings — center circle + halfway line */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[1px] w-full -translate-x-1/2 -translate-y-1/2 bg-gold/10" />
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 sm:h-[360px] sm:w-[360px]" />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20" />
      </div>
      <div className="absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

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

          <div className="relative mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6">
            <FillButton href="/register">Join the Club</FillButton>
            <OutlineButton href="https://www.facebook.com/groups/1312106901028571/user/61579023831850">
              Facebook Page
            </OutlineButton>
          </div>
        </div>

        {/* Separate stat cards */}
        <div className="relative mt-8 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-4 sm:gap-3">
          {infoItems.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="group relative flex flex-col items-center gap-1.5 rounded-xl border border-gold/20 bg-surface/60 px-2 py-3.5 backdrop-blur-sm transition-colors hover:border-gold/50 sm:gap-2 sm:py-4"
            >
              <span className="absolute left-1/2 top-0 h-[3px] w-5 -translate-x-1/2 -translate-y-px rounded-b bg-gold/40 transition-colors group-hover:bg-gold" />
              <Icon size={15} className="text-gold" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted sm:text-[10px]">
                {label}
              </p>
              <p className="max-w-[110px] truncate font-mono text-sm font-bold text-white sm:text-base">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}