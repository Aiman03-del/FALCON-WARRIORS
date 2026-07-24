"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={20} className="text-gold" />,
  error: <AlertCircle size={20} className="text-gold" />,
  info: <Info size={20} className="text-indigo-light" />,
  warning: <AlertCircle size={20} className="text-gold" />,
};

const bgColors: Record<ToastType, string> = {
  success: "bg-gold/15 border-gold/30",
  error: "bg-gold/15 border-gold/30",
  info: "bg-indigo/15 border-indigo/30",
  warning: "bg-gold/15 border-gold/30",
};

const textColors: Record<ToastType, string> = {
  success: "text-gold",
  error: "text-gold",
  info: "text-indigo-light",
  warning: "text-gold",
};

export function Toast({ id, message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border ${bgColors[type]} ${textColors[type]} px-4 py-3 text-sm font-medium animate-in slide-in-from-top-2 fade-in duration-300`}
    >
      {icons[type]}
      <p className="flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  );
}

// Hook for using toast
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  const addToast = (message: string, type: ToastType = "info", duration = 4000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
