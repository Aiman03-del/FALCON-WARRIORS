"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import ImageUploadInput from "./ImageUploadInput";
import { SiteSettings } from "@/app/lib/queries/siteSettings";

export default function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const supabase = createClient();
  const router = useRouter();

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
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Site logo and favicon updated. Some visitors may still see the old favicon for a while due to browser caching.");
    router.refresh();
  }

  return (
    <div className="card flex flex-col gap-6 p-5 sm:p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <ImageUploadInput
          folder="/falcon-warriors/site"
          value={logoUrl}
          onUploaded={(url) => setLogoUrl(url || "/logo.jpg")}
          label="Site Logo (shown in navbar, footer, sidebar, etc.)"
        />
        <ImageUploadInput
          folder="/falcon-warriors/site"
          value={faviconUrl}
          onUploaded={(url) => setFaviconUrl(url || "/favicon.png")}
          label="Favicon (browser tab icon — square image recommended)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Founded Year</label>
          <input
            value={foundedYear}
            onChange={(e) => setFoundedYear(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
            placeholder="2024"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
            placeholder="Dhaka, Bangladesh"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">President</label>
          <input
            value={presidentName}
            onChange={(e) => setPresidentName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
            placeholder="President's name"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Manager</label>
          <input
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-white/30 hover:border-border/80"
            placeholder="Manager's name"
          />
        </div>
      </div>

      <div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message && <p className="mt-2 text-xs text-indigo-light">{message}</p>}
        {error && <p className="mt-2 text-xs text-gold">{error}</p>}
      </div>
    </div>
  );
}