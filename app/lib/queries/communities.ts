import { createClient } from "../supabase/client";


export type AssociatedCommunity = {
  id: string;
  name: string;
  fullName: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
};

export async function getAssociatedCommunities(): Promise<AssociatedCommunity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("associated_communities")
    .select("id, name, full_name, logo_url, website_url")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    fullName: c.full_name,
    logoUrl: c.logo_url,
    websiteUrl: c.website_url,
  }));
}