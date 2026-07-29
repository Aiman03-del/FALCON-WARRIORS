"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="font-display text-xl font-bold uppercase tracking-wide text-gold">
        This Page Ran Into a Problem
      </h2>
      <p className="max-w-md text-sm text-muted">
        Something went wrong loading this section of the dashboard. Your
        other data is safe — try again or go back to the dashboard home.
      </p>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="btn-primary">
          Try Again
        </button>
        <a href="/dashboard" className="btn-outline">
          Dashboard Home
        </a>
      </div>
    </div>
  );
}