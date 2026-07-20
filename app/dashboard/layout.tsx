import Sidebar from "@/app/components/dashboard/Sidebar";
import { requireStaff } from "../lib/queries/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireStaff();

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role={role} />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}