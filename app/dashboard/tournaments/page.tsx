"use client";

import { useState, useEffect } from "react";
import FillButton from "@/app/components/FillButton";
import DeleteTournamentButton from "@/app/components/dashboard/DeleteTournamentButton";
import Link from "next/link";
import { Edit3, Plus } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

const statusStyles: Record<string, string> = {
  upcoming: "bg-white/10 text-muted",
  ongoing: "bg-red-500/15 text-red-400",
  completed: "bg-indigo/20 text-indigo-light",
};

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState<"official" | "unofficial">("official");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

 async function fetchTournaments() {
    setFetchError(null);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("id, name, type, format, status, start_date, end_date")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Failed to fetch tournaments:", error);
      setFetchError(error.message);
    } else {
      setTournaments(data ?? []);
    }
    setLoading(false);
  }
  function handleTournamentDeleted(id: string) {
    setTournaments((current) => current.filter((tournament) => tournament.id !== id));
  }

  const filteredTournaments = (tournaments ?? []).filter((t) =>
    activeTab === "official" ? t.type === "official" : t.type === "internal"
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Tournaments
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage internal leagues and official tournament records.
          </p>
        </div>
        <FillButton href="/dashboard/tournaments/new" className="flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Tournament
        </FillButton>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("official")}
          className={`px-4 py-3 font-medium text-sm transition ${
            activeTab === "official"
              ? "border-b-2 border-gold text-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          Official
        </button>
        <button
          onClick={() => setActiveTab("unofficial")}
          className={`px-4 py-3 font-medium text-sm transition ${
            activeTab === "unofficial"
              ? "border-b-2 border-gold text-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          Unofficial
        </button>
      </div>

      {fetchError && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Failed to load tournaments: {fetchError}
        </p>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTournaments.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/dashboard/tournaments/${t.id}`}
                    className="text-gold transition hover:text-gold-light"
                  >
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted capitalize">{t.format ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {t.start_date ? new Date(t.start_date).toLocaleDateString() : "—"}
                  {t.end_date ? ` – ${new Date(t.end_date).toLocaleDateString()}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyles[t.status]}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/dashboard/tournaments/${t.id}?tab=edit`}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-gold transition hover:bg-gold/10 hover:text-gold-light"
                      aria-label="Edit tournament"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <DeleteTournamentButton id={t.id} onDeleted={handleTournamentDeleted} />
                  </div>
                </td>
              </tr>
            ))}
            {filteredTournaments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No {activeTab} tournaments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
