import FillButton from "@/app/components/FillButton";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/client";

const statusStyles: Record<string, string> = {
  upcoming: "bg-white/10 text-muted",
  ongoing: "bg-red-500/15 text-red-400",
  completed: "bg-indigo/20 text-indigo-light",
};

export default async function TournamentsPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, type, format, status, start_date, end_date")
    .order("start_date", { ascending: false });

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

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(tournaments ?? []).map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-muted capitalize">{t.type}</td>
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
                  <Link
                    href={`/dashboard/tournaments/${t.id}`}
                    className="text-xs font-medium text-gold hover:text-gold-light"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
            {(tournaments ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No tournaments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}