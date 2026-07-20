import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { requireStaff } from "@/app/lib/queries/dashboard";
import NewsForm from "@/app/components/dashboard/NewsForm";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: newsItem } = await supabase
    .from("news")
    .select("id, title, content, category, cover_image_url")
    .eq("id", id)
    .single();

  if (!newsItem) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Edit News Post
      </h1>
      <p className="mt-1 text-sm text-muted">{newsItem.title}</p>
      <NewsForm
        mode="edit"
        newsId={newsItem.id}
        initial={{
          title: newsItem.title,
          content: newsItem.content,
          category: newsItem.category ?? "club_news",
          cover_image_url: newsItem.cover_image_url,
        }}
      />
    </div>
  );
}
