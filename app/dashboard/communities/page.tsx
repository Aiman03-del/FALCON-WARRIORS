import Link from "next/link";
import { Plus } from "lucide-react";
import FillButton from "@/app/components/FillButton";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";
import DeleteCommunityButton from "@/app/components/dashboard/DeleteCommunityButton";
export default async function CommunitiesPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: communities } = await supabase
    .from("associated_communities")
    .select("id, name, full_name, logo_url, website_url, display_order, is_active")
    .order("display_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Associated Communities
          </h1>
          <p className="mt-1 text-sm text-muted">
            Leagues / communities Falcon Warriors plays in — shown on the home page and dashboard overview.
          </p>
        </div>
        <FillButton href="/dashboard/communities/new" className="flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Community
        </FillButton>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(communities ?? []).map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted">{c.display_order}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted">{c.full_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      c.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-muted"
                    }`}
                  >
                    {c.is_active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/dashboard/communities/${c.id}/edit`}
                      className="text-xs font-medium text-gold hover:text-gold-light"
                    >
                      Edit
                    </Link>
                    <DeleteCommunityButton id={c.id} />
                  </div>
                </td>
              </tr>
            ))}
            {(communities ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No communities added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}