"use client";

import { useRef } from "react";
import BracketView, { type BracketViewHandle } from "@/app/components/BracketView";
import DownloadBracketIconButton from "@/app/components/DownloadBracketIconButton";

export default function BracketPanel({
  fixtureGenerator,
  tournamentName,
  matches,
  mode,
  editable,
  tournamentId,
  format,
}: {
  fixtureGenerator?: React.ReactNode;
  tournamentName: string;
  matches: any[];
  mode: "knockout" | "league";
  editable?: boolean;
  tournamentId?: string;
  format?: string;
}) {
  const bracketRef = useRef<BracketViewHandle>(null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>{fixtureGenerator}</div>
        <DownloadBracketIconButton bracketRef={bracketRef} tournamentName={tournamentName} />
      </div>
      <BracketView
        ref={bracketRef}
        matches={matches}
        mode={mode}
        editable={editable}
        tournamentId={tournamentId}
        format={format}
        tournamentName={tournamentName}
      />
    </div>
  );
}