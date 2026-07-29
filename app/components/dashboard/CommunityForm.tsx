"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import ImageUploadInput from "@/app/components/ImageUploadInput";

type CommunityFormProps = {
  mode: "create" | "edit";
  communityId?: string;
  initial?: {
    name: string;
    full_name: string | null;
    logo_url: string | null;
    website_url: string | null;
    display_order: number;
    is_active: boolean;
  };
};

export default function CommunityForm({ mode, communityId, initial }: CommunityFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial?.website_url ?? "");
  const [displayOrder, setDisplayOrder] = useState(String(initial?.display_order ?? 0));
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      full_name: fullName || null,
      logo_url: logoUrl || null,
      website_url: websiteUrl || null,
      display_order: Number(displayOrder) || 0,
      is_active: isActive,
    };

    const { error: dbError } =
      mode === "create"
        ? await supabase.from("associated_communities").insert(payload)
        : await supabase.from("associated_communities").update(payload).eq("id", communityId);

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push("/dashboard/communities");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Short Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="COBEG"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Full Name (optional)</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Cox's Bazar eFootball Gaming"
        />
      </div>

      <ImageUploadInput
        label="Logo (optional)"
        folder="/falcon-warriors/communities"
        value={logoUrl}
        onUploaded={setLogoUrl}
      />

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Website URL (optional)</label>
        <input
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Display Order</label>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          className="w-32 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-gold"
        />
        Visible on site (active)
      </label>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
        {loading ? "Saving..." : mode === "create" ? "Add Community" : "Save Changes"}
      </button>
    </form>
  );
}