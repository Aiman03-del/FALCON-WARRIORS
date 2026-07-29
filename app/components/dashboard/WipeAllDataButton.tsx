"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/app/providers/ToastProvider";
import { wipeAllData } from "@/app/lib/actions/wipeAllData";

const CONFIRM_PHRASE = "DELETE ALL DATA";

export default function WipeAllDataButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  function close() {
    if (isLoading) return;
    setIsOpen(false);
    setTypedText("");
  }

  async function handleWipe() {
    setIsLoading(true);
    try {
      const result = await wipeAllData(typedText);
      if (!result.ok) {
        addToast(result.error, "error");
        return;
      }
      addToast("All site data has been cleared.", "success");
      setIsOpen(false);
      setTypedText("");
      router.refresh();
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to wipe data.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-red-400 transition hover:bg-red-500/20"
      >
        <AlertTriangle size={16} />
        Wipe All Site Data
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-red-500/40 bg-surface p-6 shadow-2xl shadow-black/50">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-red-400" />
                <h2 className="font-display text-lg font-bold text-white">
                  Wipe All Site Data
                </h2>
              </div>
              <button
                onClick={close}
                disabled={isLoading}
                className="rounded p-1 text-muted transition-colors hover:bg-surface-2 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-2 text-sm text-muted">
              This permanently deletes every player, match, tournament, news post,
              gallery item, achievement, award, and community record across the
              entire site. This action cannot be undone.
            </p>
            <p className="mb-4 text-sm text-muted">
              Type <span className="font-bold text-red-400">{CONFIRM_PHRASE}</span> below
              to confirm.
            </p>

            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60 disabled:opacity-50"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={close}
                disabled={isLoading}
                className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-surface disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWipe}
                disabled={isLoading || typedText !== CONFIRM_PHRASE}
                className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Wiping…" : "Yes, Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}