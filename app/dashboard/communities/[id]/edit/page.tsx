import { notFound } from "next/navigation";
import CommunityForm from "@/app/components/dashboard/CommunityForm";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { createClient } from "@/app/lib/supabase/server";

export default async function EditCommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: community } = await supabase
    .from("associated_communities")
    .select("name, full_name, logo_url, website_url, display_order, is_active")
    .eq("id", id)
    .single();

  if (!community) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Edit Community
      </h1>
      <CommunityForm mode="edit" communityId={id} initial={community} />
    </div>
  );
}