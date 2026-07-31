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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase
      .from("site_settings")
      .update({ logo_url: logoUrl, favicon_url: faviconUrl, updated_at: new Date().toISOString() })
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