import DashboardShell from "@/app/components/dashboard/DashboardShell";
import { requireStaff } from "../lib/queries/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireStaff();

  return <DashboardShell role={role}>{children}</DashboardShell>;
}