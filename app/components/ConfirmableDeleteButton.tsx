"use client";

import { Trash2 } from "lucide-react";
import ConfirmActionButton from "./ConfirmActionButton";

export default function ConfirmableDeleteButton({
  onDelete,
  label,
}: {
  onDelete: () => Promise<void>;
  label: string;
}) {
  return (
    <ConfirmActionButton
      onConfirm={onDelete}
      confirmTitle="Confirm Delete"
      confirmMessage={`Are you sure you want to delete ${label}? This cannot be undone.`}
      confirmText="Yes, Delete"
      cancelText="Cancel"
      successMessage="Item deleted successfully."
      errorMessage="Failed to delete item. Please try again."
      isDangerous
      ariaLabel={`Delete ${label}`}
      buttonClassName="text-gold hover:text-red-300 disabled:opacity-50"
    >
      <Trash2 size={14} />
    </ConfirmActionButton>
  );
}
