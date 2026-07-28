"use client";

import { AlertTriangle } from "lucide-react";

export default function SuspendedAccountBanner() {
  return (
    <div
      className="sticky top-0 z-[60] border-b border-gold/40 bg-gold/15 px-4 py-3 text-sm text-gold"
      role="alert"
      data-suspension-allowed
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold uppercase tracking-wide">Account suspended</p>
          <p className="mt-1 text-gold/90">
            Your membership has been suspended. Your data is still on record, but you cannot edit
            your profile, join activities, or use dashboard features until an admin reactivates your
            account.
          </p>
        </div>
      </div>
    </div>
  );
}
