import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BackLink from "@/app/components/BackLink";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("news").select("title").eq("id", id).single();
  return {
    title: data?.title ? `${data.title} | Falcon Warriors` : "News | Falcon Warriors",
  };
}

function isSafe(src: string | null | undefined) {
  if (!src?.trim()) return false;
  return src.startsWith("/") || /^https?:\/\//i.test(src);
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("news")
    .select("id, title, content, category, cover_image_url, published_at")
    .eq("id", id)
    .single();

  if (!article) notFound();

  const date = new Date(article.published_at).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const catLabel = (article.category ?? "club_news").replace(/_/g, " ").toUpperCase();

  return (
    <main>
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Back */}
        <BackLink href="/news" label="All News" />

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-bold uppercase text-gold">
            <Tag size={10} />
            {catLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={11} />
            {date}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-4 font-display text-2xl font-bold leading-snug uppercase tracking-wide sm:text-3xl md:text-4xl">
          {article.title}
        </h1>

        {/* Cover Image */}
        {isSafe(article.cover_image_url) && (
          <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl border border-border sm:mt-8">
            <Image
              src={article.cover_image_url as string}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Content */}
        {article.content ? (
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-white/85 sm:text-base">
            {article.content.split("\n").map((para: string, i: number) =>
              para.trim() ? (
                <p key={i} className="mb-4">
                  {para}
                </p>
              ) : (
                <br key={i} />
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">No content available for this article.</p>
        )}

        {/* Footer nav */}
        <div className="mt-12 border-t border-border pt-6">
          <BackLink href="/news" label="Back to all news" />
        </div>
      </article>
      <Footer />
    </main>
  );
}
