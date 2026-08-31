import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import { createClient } from "@/app/lib/supabase/server";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";

export default async function Hero() {
  const { foundedYear, location, presidentName, managerName } = await getSiteSettings();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryCta = user
    ? { href: "/profile", label: "My Profile", iconName: "userCircle" as const }
    : { href: "/register", label: "Join the Club", iconName: "users" as const };

  return (
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden border-b border-border bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(7,17,28,0.26),rgba(5,7,11,0.62)_52%,rgba(5,7,11,0.88))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--fw-glow),transparent_42%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--fw-overlay)] via-[var(--fw-bg-primary)]/40 to-[var(--fw-bg-primary)]/80" />

      <HeroBackground />

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