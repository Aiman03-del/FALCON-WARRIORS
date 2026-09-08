import { createClient } from "@/app/lib/supabase/client";

export type SiteSettings = {
  logoUrl: string;
  faviconUrl: string;
  foundedYear: string;
  location: string;
  presidentName: string;
  managerName: string;
  themeKey: string; // new
};

const DEFAULTS: SiteSettings = {
  logoUrl: "/logo.jpg",
  faviconUrl: "/favicon.png",
  foundedYear: "2024",
  location: "Global",
  presidentName: "TBA",
  managerName: "TBA",
  themeKey: "indigo", // new
};

// This function is intentionally created with the browser client (anon key) — because
// the logo/favicon data is fully public, it can be called the same way from both server and client
// without requiring any cookie/session.
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient();
        const { data, error } = await supabase
      .from("site_settings")
      .select("logo_url, favicon_url, founded_year, location, president_name, manager_name, theme_key")
      .eq("id", 1)
      .single();

    if (error || !data) return DEFAULTS;

    return {
      logoUrl: data.logo_url || DEFAULTS.logoUrl,
      faviconUrl: data.favicon_url || DEFAULTS.faviconUrl,
      foundedYear: data.founded_year || DEFAULTS.foundedYear,
      location: data.location || DEFAULTS.location,
      presidentName: data.president_name || DEFAULTS.presidentName,
      managerName: data.manager_name || DEFAULTS.managerName,
      themeKey: data.theme_key || DEFAULTS.themeKey, // new
    };
  } catch {
    return DEFAULTS;
  }
}