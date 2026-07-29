import type { MetadataRoute } from "next";
import { createClient } from "./lib/supabase/client";

const BASE_URL = "https://falcon-warriors.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/players`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/matches`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/tournaments`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/news`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/leaderboards`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/achievements`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/ballon-dor`, changeFrequency: "weekly", priority: 0.6 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    const [players, matches, tournaments, news] = await Promise.all([
      supabase.from("player_details").select("id, slug, created_at"),
      supabase.from("matches").select("id, created_at"),
      supabase.from("tournaments").select("id, created_at"),
      supabase.from("news").select("id, created_at"),
    ]);

    dynamicRoutes = [
      ...(players.data ?? []).map((row) => ({
        url: `${BASE_URL}/players/${row.slug ?? row.id}`,
        lastModified: row.created_at,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...(matches.data ?? []).map((row) => ({
        url: `${BASE_URL}/matches/${row.id}`,
        lastModified: row.created_at,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      ...(tournaments.data ?? []).map((row) => ({
        url: `${BASE_URL}/tournaments/${row.id}`,
        lastModified: row.created_at,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...(news.data ?? []).map((row) => ({
        url: `${BASE_URL}/news/${row.id}`,
        lastModified: row.created_at,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch (err) {
    console.error("Failed to build dynamic sitemap entries:", err);
    // Fall back to just the static routes if Supabase is unreachable at build time
  }

  return [...staticRoutes, ...dynamicRoutes];
}