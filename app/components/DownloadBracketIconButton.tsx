"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { Download } from "lucide-react";
import type { BracketViewHandle } from "@/app/components/BracketView";

export default function DownloadBracketIconButton({
  bracketRef,
  tournamentName,
}: {
  bracketRef: RefObject<BracketViewHandle | null>;
  tournamentName: string;
}) {
  const [downloading, setDownloading] = useState(false);

  async function handleClick() {
    if (!bracketRef.current) return;
    setDownloading(true);
    try {
      await bracketRef.current.downloadImage(tournamentName);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="group/dl relative inline-flex">
      <button
        onClick={handleClick}
        disabled={downloading}
        aria-label="Save Bracket Image"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-gold transition hover:border-gold/60 hover:bg-surface disabled:opacity-40"
      >
        <Download size={16} />
      </button>
      <span className="pointer-events-none absolute -top-9 right-0 z-20 whitespace-nowrap rounded-md border border-border bg-bg px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/dl:opacity-100">
        {downloading ? "Exporting..." : "Save Bracket Image"}
      </span>
    </div>
  );
}