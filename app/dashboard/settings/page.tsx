import { Settings } from "lucide-react";
import { requireStaff } from "@/app/lib/queries/dashboard";
import { getSiteSettings } from "@/app/lib/queries/siteSettings";
import SiteSettingsForm from "@/app/components/dashboard/SiteSettingsForm";
import { redirect } from "next/navigation";

export default async function SiteSettingsPage() {
  const { role } = await requireStaff();
  if (role !== "admin") redirect("/dashboard");

  const settings = await getSiteSettings();

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Site Settings</h1>
          <p className="mt-0.5 text-sm text-muted">
            Change the club logo, favicon, and public club info shown across the site.
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-3xl">
        <SiteSettingsForm initial={settings} />
      </div>
    </div>
  );
}