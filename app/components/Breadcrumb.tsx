import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-xs text-muted mb-4 ${className}`}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight size={14} />}
          {item.current ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : item.href ? (
            <Link href={item.href} className="hover:text-gold transition-colors">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
