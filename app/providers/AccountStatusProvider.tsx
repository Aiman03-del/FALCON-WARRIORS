"use client";

import { createContext, useContext, useEffect } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import SuspendedAccountBanner from "@/app/components/SuspendedAccountBanner";

const SUSPENDED_MESSAGE =
  "Your account has been suspended. You cannot perform actions on the site. Please contact an admin.";

type AccountStatusContextValue = {
  isSuspended: boolean;
  membershipStatus: string | null;
};

const AccountStatusContext = createContext<AccountStatusContextValue>({
  isSuspended: false,
  membershipStatus: null,
});

export function useAccountStatus() {
  return useContext(AccountStatusContext);
}

export function AccountStatusProvider({
  children,
  membershipStatus,
  isLoggedIn,
}: {
  children: React.ReactNode;
  membershipStatus: string | null;
  isLoggedIn: boolean;
}) {
  const isSuspended = isLoggedIn && membershipStatus === "suspended";
  const { addToast } = useToast();

  useEffect(() => {
    if (!isSuspended) return;

    addToast(
      "Your account has been suspended. You can browse the site but cannot make changes or use interactive features.",
      "error",
      9000
    );

    function blockAction(event: Event) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-suspension-allowed]")) return;

      const interactive = target.closest(
        "button, input, select, textarea, form, a[href*='/profile/edit'], a[href*='/dashboard'], a[href*='/register']"
      );

      if (!interactive) return;

      event.preventDefault();
      event.stopPropagation();
      addToast(SUSPENDED_MESSAGE, "error");
    }

    document.addEventListener("click", blockAction, true);
    document.addEventListener("submit", blockAction, true);

    return () => {
      document.removeEventListener("click", blockAction, true);
      document.removeEventListener("submit", blockAction, true);
    };
  }, [isSuspended, addToast]);

  return (
    <AccountStatusContext.Provider value={{ isSuspended, membershipStatus }}>
      {isSuspended && <SuspendedAccountBanner />}
      {children}
    </AccountStatusContext.Provider>
  );
}
