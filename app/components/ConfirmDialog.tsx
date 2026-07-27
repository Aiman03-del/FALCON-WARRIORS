"use client";

import { AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className={isDangerous ? "text-gold" : "text-indigo-light"} />
            <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-muted transition-colors hover:bg-surface-2 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <p className="mb-6 text-sm text-muted">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-surface disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              isDangerous
                ? "bg-gold/20 text-gold hover:bg-gold/30"
                : "bg-indigo/20 text-indigo-light hover:bg-indigo/30"
            }`}
          >
            {isLoading ? "Loading..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
