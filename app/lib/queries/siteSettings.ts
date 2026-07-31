import { createClient } from "@/app/lib/supabase/client";

export type SiteSettings = {
  logoUrl: string;
  faviconUrl: string;
};

// লোগো/ফেভিকন কাস্টমাইজ না করা থাকলে এই ডিফল্টগুলো ব্যবহার হবে —
// public/logo.jpg ও public/favicon.png কখনো ডিলিট করবেন না, এগুলো ফলব্যাক।
const DEFAULTS: SiteSettings = {
  logoUrl: "/logo.jpg",
  faviconUrl: "/favicon.png",
};

// এই ফাংশন ইচ্ছাকৃতভাবে ব্রাউজার ক্লায়েন্ট দিয়ে বানানো (anon key) — কারণ
// লোগো/ফেভিকন পুরোপুরি পাবলিক ডাটা, তাই সার্ভার/ক্লায়েন্ট দুই জায়গাতেই একইভাবে
// (কোনো cookie/session ছাড়াই) কল করা যায়।
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("logo_url, favicon_url")
      .eq("id", 1)
      .single();

    if (error || !data) return DEFAULTS;

    return {
      logoUrl: data.logo_url || DEFAULTS.logoUrl,
      faviconUrl: data.favicon_url || DEFAULTS.faviconUrl,
    };
  } catch {
    return DEFAULTS;
  }
}