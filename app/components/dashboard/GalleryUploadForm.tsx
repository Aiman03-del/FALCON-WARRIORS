"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import ImageUploadInput from "@/app/components/ImageUploadInput";

export default function GalleryUploadForm() {
  const supabase = createClient();
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState("");
  const [imageFileId, setImageFileId] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState("");
  const [eventTag, setEventTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleUploaded(url: string, fileId?: string) {
    setImageUrl(url);
    setImageFileId(fileId);
  }

  async function handleSave() {
    if (!imageUrl) {
      setError("Please upload an image first.");
      return;
    }
    setError(null);
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("gallery").insert({
      image_url: imageUrl,
      image_file_id: imageFileId ?? null,
      caption: caption || null,
      event_tag: eventTag || null,
      uploaded_by: userData.user?.id ?? null,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setImageUrl("");
    setImageFileId(undefined);
    setCaption("");
    setEventTag("");
    router.refresh();
  }

  return (
    <div className="card mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
      <ImageUploadInput folder="/falcon-warriors/gallery" onUploaded={handleUploaded} />

      <div className="flex flex-1 flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Caption</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="Match Winning Goal"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Event Tag (optional)
          </label>
          <input
            value={eventTag}
            onChange={(e) => setEventTag(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="World Finals 2024"
          />
        </div>

        {error && <p className="text-xs text-gold">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-fit disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add to Gallery"}
        </button>
      </div>
    </div>
  );
}