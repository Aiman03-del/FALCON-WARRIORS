"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import ImageUploadInput from "@/app/components/ImageUploadInput";

type NewsFormProps = {
  mode: "create" | "edit";
  newsId?: string;
  initial?: {
    title: string;
    content: string;
    category: string;
    cover_image_url: string | null;
  };
};

const categories = [
  { value: "match_update", label: "Match Update" },
  { value: "club_news", label: "Club News" },
  { value: "tournament_notice", label: "Tournament Notice" },
  { value: "team_update", label: "Team Update" },
  { value: "sponsorship", label: "Sponsorship" },
];

export default function NewsForm({ mode, newsId, initial }: NewsFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "club_news");
  const [coverUrl, setCoverUrl] = useState(initial?.cover_image_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "create") {
      const { data: userData } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from("news").insert({
        title,
        content,
        category,
        cover_image_url: coverUrl || null,
        author_id: userData.user?.id ?? null,
      });

      setLoading(false);
      if (insertError) {
        setError(insertError.message);
        return;
      }
    } else {
      const { error: updateError } = await supabase
        .from("news")
        .update({ title, content, category, cover_image_url: coverUrl || null })
        .eq("id", newsId);

      setLoading(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
    }

    router.push("/dashboard/news");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Season 4 Tryouts Now Open"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <ImageUploadInput
        label="Cover Image (optional)"
        folder="/falcon-warriors/news"
        value={coverUrl}
        onUploaded={setCoverUrl}
      />

      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Content</label>
        <textarea
          required
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full resize-y rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Write the full announcement here..."
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
        {loading ? "Saving..." : mode === "create" ? "Publish Post" : "Update Post"}
      </button>
    </form>
  );
}   