import FillButton from "@/app/components/FillButton";
import Link from "next/link";
import { Edit3, Plus } from "lucide-react";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import DeleteNewsButton from "@/app/components/dashboard/DeleteNewsButton";


const MOCK_DASHBOARD_NEWS = [
  { id: "news-1", title: "Falcon Warriors Secure Victory in International Championship", category: "club_news", published_at: "2026-07-24T10:00:00" },
  { id: "news-2", title: "Ahmed_Pro Named Player of the Month", category: "player_news", published_at: "2026-07-20T14:30:00" },
  { id: "news-3", title: "New Season Tournament Schedule Announced", category: "tournament", published_at: "2026-07-18T09:15:00" },
];

export default async function NewsListPage() {
  await requireStaff();
  let news = MOCK_DASHBOARD_NEWS;

  try {
    const supabase = await createClient();

    const { data: supabaseNews } = await supabase
      .from("news")
      .select("id, title, category, published_at")
      .order("published_at", { ascending: false });

    if (supabaseNews) {
      news = supabaseNews;
    }
  } catch (error) {
    // Use mock data if Supabase fails
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            News & Announcements
          </h1>
          <p className="mt-1 text-sm text-muted">Publish updates for the club.</p>
        </div>
        <FillButton href="/dashboard/news/new" className="flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Post
        </FillButton>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(news ?? []).map((n) => (
              <tr key={n.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{n.title}</td>
                <td className="px-4 py-3 text-muted">{n.category ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(n.published_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/dashboard/news/${n.id}`}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-gold transition hover:bg-gold/10 hover:text-gold-light"
                      aria-label="Edit news post"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <DeleteNewsButton id={n.id} />
                  </div>
                </td>
              </tr>
            ))}
            {(news ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No news posted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
