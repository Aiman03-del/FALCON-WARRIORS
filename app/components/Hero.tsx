import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import { createClient } from "@/app/lib/supabase/server";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";

async function getCurrentUserProfileHref() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Navbar-এর profileHref লজিকের সাথে সামঞ্জস্যপূর্ণ রাখতে player slug থাকলে
    // /players/[slug]-এ পাঠানো হচ্ছে, না থাকলে fallback হিসেবে /profile
    const { data: playerRow } = await supabase
      .from("player_details")
      .select("slug")
      .eq("profile_id", user.id)
      .single();

    return playerRow?.slug ? `/players/${playerRow.slug}` : "/profile";
  } catch (error) {
    console.error("[Hero] failed to check auth session:", error);
    return null; // fail-safe: ধরে নেওয়া হবে ইউজার লগইন করেনি, guest CTA দেখাবে
  }
}

export default async function Hero() {
  const { foundedYear, location, presidentName, managerName } = await getSiteSettings();
  const profileHref = await getCurrentUserProfileHref();

  const primaryCta = profileHref
    ? { href: profileHref, label: "My Profile", iconName: "userCircle" as const }
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