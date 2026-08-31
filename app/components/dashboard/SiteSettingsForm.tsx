"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, Crown, ImageIcon, MapPin, UserCog, AlertCircle } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { useToast } from "@/app/providers/ToastProvider";
import FillButton from "@/app/components/FillButton";
import ImageUploadInput from "./ImageUploadInput";
import { SiteSettings } from "@/app/lib/queries/siteSettings";
import { Palette } from "lucide-react";
import { THEME_PALETTES } from "@/app/lib/theme-palettes";
export default function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const supabase = createClient();
  const router = useRouter();
  const { addToast } = useToast();
const [themeKey, setThemeKey] = useState(initial.themeKey);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(initial.faviconUrl);
  const [foundedYear, setFoundedYear] = useState(initial.foundedYear);
  const [location, setLocation] = useState(initial.location);
  const [presidentName, setPresidentName] = useState(initial.presidentName);
  const [managerName, setManagerName] = useState(initial.managerName);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("site_settings")
      .update({
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        founded_year: foundedYear,
        location,
        president_name: presidentName,
        manager_name: managerName,
        updated_at: new Date().toISOString(),        theme_key: themeKey,
      })
      .eq("id", 1);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      addToast(updateError.message, "error");
      return;
    }

    const successMessage = "Site settings updated. Some visitors may still see the old favicon for a while due to browser caching.";
    setMessage(successMessage);
    addToast(successMessage, "success");
    router.refresh();
  }

  const infoFields = [
    { icon: Calendar, label: "Founded Year", value: foundedYear, set: setFoundedYear, placeholder: "2024" },
    { icon: MapPin, label: "Location", value: location, set: setLocation, placeholder: "Dhaka, Bangladesh" },
    { icon: Crown, label: "President", value: presidentName, set: setPresidentName, placeholder: "President's name" },
    { icon: UserCog, label: "Manager", value: managerName, set: setManagerName, placeholder: "Manager's name" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Branding */}
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <ImageIcon size={16} />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">Branding</h2>
            <p className="text-xs text-muted">Shown across the navbar, footer, sidebar, and browser tab.</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUploadInput
            folder="/falcon-warriors/site"
            value={logoUrl}
            onUploaded={(url) => setLogoUrl(url || "/logo.jpg")}
            label="Site Logo"
          />
          <ImageUploadInput
            folder="/falcon-warriors/site"
            value={faviconUrl}
            onUploaded={(url) => setFaviconUrl(url || "/favicon.png")}
            label="Favicon (square image recommended)"
          />
        </div>
      </div>

      {/* Club Info */}
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <Crown size={16} />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">Club Info</h2>
            <p className="text-xs text-muted">Displayed in the homepage hero section.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {infoFields.map(({ icon: Icon, label, value, set, placeholder }) => (
            <div key={label}>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <Icon size={13} className="text-gold" />
                {label}
              </label>
              <input
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-muted focus:border-white/30 hover:border-border/80"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Theme */}
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
            <Palette size={16} />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white">Theme</h2>
            <p className="text-xs text-muted">Pick an accent color for the whole site.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {THEME_PALETTES.map((palette) => {
            const active = themeKey === palette.key;
            return (
              <button
                key={palette.key}
                type="button"
                onClick={() => setThemeKey(palette.key)}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: palette.swatch,
                    borderColor: active ? "#fff" : "transparent",
                    boxShadow: active ? `0 0 0 3px ${palette.swatch}55` : "none",
                  }}
                >
                  {active && <CheckCircle2 size={16} className="text-white" />}
                </span>
                <span className="text-[11px] text-muted">{palette.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Save bar */}
      <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-h-5">
          {message && (
            <p className="flex items-center gap-1.5 text-xs text-indigo-light">
              <CheckCircle2 size={14} />
              {message}
            </p>
          )}
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-gold">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
          {!message && !error && (
            <p className="text-xs text-muted">Changes apply site-wide immediately after saving.</p>
          )}
        </div>
        <FillButton onClick={handleSave} disabled={saving} className="shrink-0 text-sm">
          {saving ? "Saving..." : "Save Changes"}
        </FillButton>
      </div>
    </div>
  );
}