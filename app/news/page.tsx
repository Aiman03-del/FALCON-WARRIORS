import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Newspaper, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "News | Falcon Warriors - Latest Updates",
  description: "Latest news, announcements and match reports from Falcon Warriors eFootball club.",
  openGraph: {
    title: "News | Falcon Warriors",
    description: "Latest news and announcements from Falcon Warriors.",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  club_news: "text-gold",
  match_report: "text-indigo-light",
  announcement: "text-gold",
  transfer: "text-indigo",
  achievement: "text-gold",
};

function isSafe(src: string | null | undefined) {
  if (!src?.trim()) return false;
  return src.startsWith("/") || /^https?:\/\//i.test(src);
}

export default async function NewsPage() {
  const supabase = await createClient();

  const { data: news } = await supabase
    .from("news")
    .select("id, title, category, cover_image_url, published_at")
    .order("published_at", { ascending: false });

  const all = news ?? [];

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="section-divider" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
          News &amp; Updates
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Newspaper size={14} />
          {all.length} {all.length === 1 ? "article" : "articles"} published
        </p>

        {all.length === 0 ? (
          <div className="card mt-12 flex flex-col items-center gap-4 py-16 text-center">
            <Newspaper size={40} className="text-muted/30" />
            <p className="text-sm text-muted">No news published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {all.map((n) => {
              const catColor = CATEGORY_COLORS[n.category ?? "club_news"] ?? "text-gold";
              const catLabel = (n.category ?? "club_news").replace(/_/g, " ").toUpperCase();
              const date = new Date(n.published_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <Link
                  key={n.id}
                  href={`/news/${n.id}`}
                  className="card group flex flex-col overflow-hidden transition-all duration-200 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5"
                >
                  {/* Cover */}
                  <div className="relative h-44 w-full shrink-0 bg-surface-2">
                    {isSafe(n.cover_image_url) ? (
                      <Image
                        src={n.cover_image_url as string}
                        alt={n.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo/20 via-surface to-gold/10">
                        <Newspaper size={32} className="text-muted/30" />
                      </div>
                    )}
                    {/* Category pill over image */}
                    <span className={`absolute left-3 top-3 rounded-full bg-bg/80 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur-sm ${catColor}`}>
                      {catLabel}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h2 className="flex-1 text-sm font-semibold leading-snug text-white group-hover:text-gold-light">
                      {n.title}
                    </h2>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        {date}
                      </span>
                      <span className="text-gold opacity-0 transition-opacity group-hover:opacity-100">
                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
