import Image from "next/image";
import Link from "next/link";

type NewsItem = {
  id: string;
  category: string;
  title: string;
  date: string;
  imageUrl: string | null;
};

function isSafeImageSrc(src: string | null | undefined) {
  if (!src) return false;
  const value = src.trim();
  if (!value) return false;
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

export default function LatestNews({ news }: { news: NewsItem[] }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="section-divider" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wide sm:text-2xl">
              Latest News
            </h2>
          </div>
          <Link href="/news" className="text-sm font-medium text-gold hover:text-gold-light">
            View All →
          </Link>
        </div>

        {news.length === 0 ? (
          <p className="text-sm text-muted">No news published yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {news.map((n) => (
              <Link key={n.id} href={`/news/${n.id}`} className="card group overflow-hidden">
                <div className="relative h-36 w-full bg-surface-2 sm:h-40">
                  {isSafeImageSrc(n.imageUrl) ? (
                    <Image
                      src={n.imageUrl as string}
                      alt={n.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo/30 to-surface" />
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gold">
                    {n.category}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-white group-hover:text-gold-light">
                    {n.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted sm:mt-4">
                    <span>{n.date}</span>
                    <span className="text-gold">Read More →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}