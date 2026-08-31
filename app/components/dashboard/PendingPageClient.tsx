"use client";
import { useRouter } from "next/navigation";
import PendingUsersTable from "@/app/components/dashboard/PendingUsersTable";

type PendingPlayer = {
  id: string;
  slug: string;
  efootball_username: string;
  real_name: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  platform: string | null;
  join_date: string;
};

export default function PendingPageClient({ initialPlayers }: { initialPlayers: PendingPlayer[] }) {
  const router = useRouter();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Pending Approvals</h1>
      <p className="mt-1 text-sm text-muted">
        Review new registrations before they get full access to the site.
      </p>
      <PendingUsersTable players={initialPlayers} onRefresh={() => router.refresh()} />
    </div>
  );
}
