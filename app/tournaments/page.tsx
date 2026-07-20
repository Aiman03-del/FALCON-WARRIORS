import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TournamentStatusBadge from "@/app/components/TournamentStatusBadge";
import { Trophy, Calendar, Layers } from "lucide-react";

export const metadata = {
  title: "Tournaments | Falcon Warriors",
  description: "Official tournament history and ongoing leagues for Falcon Warriors eFootball club.",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-white/8 text-muted" },
  ongoing: { label: "🔴 Ongoing", className: "bg-red-500/15 text-red-400" },
  completed: { label: "Completed", className: "bg-indigo/20 text-indigo-light" },
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TournamentsPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, type, format, status, start_date, end_date")
    .order("start_date", { ascending: false });

  const all = tournaments ?? [];
  const ongoing = all.filter((t) => t.status === "ongoing");
  const upcoming = all.filter((t) => t.status === "upcoming");
  const completed = all.filter((t) => t.status === "completed");

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="section-divider" />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
          Tournaments
        </h1>
        <p className="mt-2 text-sm text-muted">
          {all.length} tournaments · {ongoing.length} ongoing
        </p>

        {all.length === 0 ? (
          <div className="card mt-10 flex flex-col items-center gap-3 py-16 text-center">
            <Trophy size={40} className="text-muted/30" />
            <p className="text-sm text-muted">No tournaments recorded yet.</p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {/* Ongoing first */}
            {[...ongoing, ...upcoming, ...completed].map((t) => {
              const status = statusConfig[t.status] ?? statusConfig.upcoming;
              const startDate = formatDate(t.start_date);
              const endDate = formatDate(t.end_date);
              return (
                <Link key={t.id} href={`/tournaments/${t.id}`} className="block">
                  <div className="card p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-lg font-bold uppercase tracking-wide sm:text-xl">
                            {t.name}
                          </h2>
                          <TournamentStatusBadge status={t.status} />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                          {t.type && (
                            <span className="flex items-center gap-1 capitalize">
                              <Trophy size={11} className="text-gold" />
                              {t.type}
                            </span>
                          )}
                          {t.format && (
                            <span className="flex items-center gap-1 capitalize">
                              <Layers size={11} className="text-indigo" />
                              {t.format}
                            </span>
                          )}
                          {startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {startDate}
                              {endDate ? ` → ${endDate}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
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
