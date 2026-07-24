import React from "react";
import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-4 rounded-lg border border-white/10 bg-background/50 py-12 text-center ${className}`}>
      <Icon size={48} className="text-muted/30" />
      <div>
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && (
        <a
          href={action.href || "#"}
          onClick={(e) => {
            if (!action.href && action.onClick) {
              e.preventDefault();
              action.onClick();
            }
          }}
          className="mt-2 inline-flex px-4 py-2 rounded-lg bg-indigo/20 text-sm font-medium text-indigo-light hover:bg-indigo/30 transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
