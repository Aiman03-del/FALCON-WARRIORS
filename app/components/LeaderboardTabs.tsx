"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { LeaderboardData, LeaderboardScope } from "../lib/queries/leaderboards";
import LeaderboardList from "./LeaderboardList";

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9\-_ ]/g, "").replace(/\s+/g, "-") || "leaderboard";
}

type ScopedLeaderboardData = Record<LeaderboardScope, LeaderboardData>;

const scopeTabs: Array<{ key: LeaderboardScope; label: string; description: string }> = [
  {
    key: "official",
    label: "Official",
    description: "Rankings from external club matches and official tournaments.",
  },
  {
    key: "unofficial",
    label: "Unofficial",
    description: "Rankings from internal player-vs-player matches and club tournaments.",
  },
];

const PAGE_SIZE = 10;

export default function LeaderboardTabs({
  data,
  isAdmin = false,
}: {
  data: ScopedLeaderboardData;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [activeScope, setActiveScope] = useState<LeaderboardScope>(
    searchParams.get("tab") === "unofficial" ? "unofficial" : "official"
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextTab = searchParams.get("tab") === "unofficial" ? "unofficial" : "official";
    setActiveScope(nextTab);
    setPage(1);
  }, [searchParams]);

  const currentEntries = data[activeScope].points;
  const totalPages = Math.max(1, Math.ceil(currentEntries.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageEntries = currentEntries.slice(startIndex, endIndex);
  const activeScopeTab = scopeTabs.find((tab) => tab.key === activeScope);
  const displayManageColumn = isAdmin && !isDownloading;

  async function handleDownloadLeaderboard() {
    if (!captureRef.current || pageEntries.length === 0) return;

    const prevScrollX = window.scrollX;
    const prevScrollY = window.scrollY;

    setIsDownloading(true);

    try {
      window.scrollTo({ top: 0, left: 0 });
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: "#0A0B0F",
        pixelRatio: 2,
        cacheBust: true,
        width: captureRef.current.scrollWidth,
        height: captureRef.current.scrollHeight,
        style: {
          padding: "8px",
          margin: "0",
          transform: "none",
        },
      });

      const link = document.createElement("a");
      link.download = `${sanitizeFilename(`${activeScopeTab?.label ?? "Leaderboard"}-Top-10`)}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      window.scrollTo({ top: prevScrollY, left: prevScrollX });
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-b border-border">
        <div className="flex flex-wrap gap-4">
          {scopeTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("tab", tab.key);
                router.replace(`/dashboard/leaderboard?${params.toString()}`);
                setActiveScope(tab.key);
                setPage(1);
              }}
              className={`cursor-pointer px-4 py-3 text-sm font-medium transition ${
                activeScope === tab.key
                  ? "border-b-2 border-gold text-gold"
                  : "text-muted hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDownloadLeaderboard}
          disabled={isDownloading || pageEntries.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gold transition hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={14} />
          {isDownloading ? "Downloading..." : "Download Top 10"}
        </button>
      </div>

      <div ref={captureRef} className="rounded-xl border border-border bg-surface-2/60 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gold">
          {activeScopeTab?.label} · Ranked by Points
        </p>
        <p className="mt-1 text-sm text-muted">{activeScopeTab?.description}</p>

        <div className="mt-4">
          <LeaderboardList
            entries={pageEntries}
            emptyMessage={`No ${activeScopeTab?.label.toLowerCase()} rankings yet.`}
            isAdmin={isAdmin}
            hideManageColumn={isDownloading}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          Showing {currentEntries.length === 0 ? 0 : startIndex + 1}–
          {Math.min(currentEntries.length, endIndex)} of {currentEntries.length} players
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}