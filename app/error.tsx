"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your monitoring service here if you add one later
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-gold">
        Something Went Wrong
      </h1>
      <p className="max-w-md text-sm text-muted">
        An unexpected error occurred while loading this page. You can try
        again, or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="btn-primary">
          Try Again
        </button>
        <a href="/" className="btn-outline">
          Go Home
        </a>
      </div>
    </div>
  );
}