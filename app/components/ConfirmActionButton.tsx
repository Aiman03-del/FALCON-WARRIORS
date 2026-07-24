"use client";

import { useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { ConfirmDialog } from "./ConfirmDialog";

type ConfirmActionButtonProps = {
  onConfirm: () => Promise<void>;
  confirmTitle: string;
  confirmMessage: string;
  confirmText?: string;
  cancelText?: string;
  successMessage?: string;
  errorMessage?: string;
  isDangerous?: boolean;
  ariaLabel?: string;
  buttonClassName?: string;
  children: React.ReactNode;
};

export default function ConfirmActionButton({
  onConfirm,
  confirmTitle,
  confirmMessage,
  confirmText = "Delete",
  cancelText = "Cancel",
  successMessage = "Action completed successfully.",
  errorMessage = "Something went wrong. Please try again.",
  isDangerous = false,
  ariaLabel,
  buttonClassName,
  children,
}: ConfirmActionButtonProps) {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    try {
      await onConfirm();
      addToast(successMessage, "success");
      setIsOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
      >
        {children}
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText={cancelText}
        isDangerous={isDangerous}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
        isLoading={isLoading}
      />
    </>
  );
}
