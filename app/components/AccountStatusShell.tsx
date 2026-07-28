import { createClient } from "@/app/lib/supabase/server";
import { AccountStatusProvider } from "@/app/providers/AccountStatusProvider";

export default async function AccountStatusShell({
  children,
}: {
  children: React.ReactNode;
}) {
  let membershipStatus: string | null = null;
  let isLoggedIn = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    isLoggedIn = !!user;

    if (user) {
      const { data: player } = await supabase
        .from("player_details")
        .select("membership_status")
        .eq("profile_id", user.id)
        .maybeSingle();

      membershipStatus = player?.membership_status ?? null;
    }
  } catch {
    // Supabase may be unavailable in some environments; skip status wrapping.
  }

  return (
    <AccountStatusProvider membershipStatus={membershipStatus} isLoggedIn={isLoggedIn}>
      {children}
    </AccountStatusProvider>
  );
}
