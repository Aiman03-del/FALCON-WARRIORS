import { createClient } from "../supabase/client";


export async function getBallonDorData() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("ballon_dor_nominees")
    .select("id, year, is_winner, player_details(id, slug, efootball_username, real_name, avatar_url)")
    .order("year", { ascending: false });

  const grouped = (data ?? []).reduce((acc: Record<number, any[]>, n: any) => {
    acc[n.year] = acc[n.year] ?? [];
    acc[n.year].push(n);
    return acc;
  }, {});

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return { grouped, years };
}