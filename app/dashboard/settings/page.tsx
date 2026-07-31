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
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Site Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Change the club logo and browser favicon shown across the whole site.
      </p>

      <div className="mt-6">
        <SiteSettingsForm initial={settings} />
      </div>
    </div>
  );
}