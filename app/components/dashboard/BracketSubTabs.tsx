"use client";

import { useState } from "react";

export default function BracketSubTabs({
  groupStageContent,
  knockoutContent,
  groupStageLabel = "Group Stage",
}: {
  groupStageContent: React.ReactNode;
  knockoutContent: React.ReactNode;
  groupStageLabel?: string;
}) {
  const [tab, setTab] = useState<"stage" | "knockout">("stage");

  const tabClass = (t: "stage" | "knockout") =>
    `rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
      tab === t
        ? "bg-gold text-black"
        : "border border-border bg-surface-2 text-muted hover:text-white"
    }`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("stage")} className={tabClass("stage")}>
          {groupStageLabel}
        </button>
        <button type="button" onClick={() => setTab("knockout")} className={tabClass("knockout")}>
          Knockout
        </button>
      </div>
      {tab === "stage" ? groupStageContent : knockoutContent}
    </div>
  );
}