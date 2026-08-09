import { UserCircle, Users } from 'lucide-react';
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import { createClient } from "@/app/lib/supabase/server";
import HeroContent from "./HeroContent";

export default async function Hero() {
  const { foundedYear, location, presidentName, managerName } = await getSiteSettings();

  // লগইন করা থাকলে "Join the Club"-এর বদলে "My Profile" দেখাবে
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryCta = user
    ? { href: "/profile", label: "My Profile", iconName: "userCircle" as const }
    : { href: "/register", label: "Join the Club", iconName: "users" as const };

  return (
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden border-b border-border bg-background">
      {/* Pitch markings — center circle + halfway line */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-gold/10" />
        <div className="absolute left-1/2 top-1/2 h-55 w-55 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 sm:h-90 sm:w-90" />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20" />
      </div>
      <div className="absolute left-1/2 top-0 h-75 w-125 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <HeroContent
        foundedYear={foundedYear}
        location={location}
        presidentName={presidentName}
        managerName={managerName}
        primaryCta={primaryCta}
      />
    </section>
  );
}