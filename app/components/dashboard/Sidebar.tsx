"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Newspaper,
  Swords,
  Image as ImageIcon,
  Award,
  ArrowLeft,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Matches", href: "/dashboard/matches", icon: Swords },
  { label: "Tournaments", href: "/dashboard/tournaments", icon: Trophy },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { label: "Achievements", href: "/dashboard/achievements", icon: Award },
  { label: "Ballon d'Or", href: "/dashboard/ballon-dor", icon: Star },
  { label: "News", href: "/dashboard/news", icon: Newspaper },
  { label: "Gallery", href: "/dashboard/gallery", icon: ImageIcon },
];

type DashboardSidebarProps = {
  role: string;
  className?: string;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardSidebar({
  role,
  className = "",
  onClose,
  collapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const defaultClasses = className
    ? `${className} shrink-0 border-r border-border bg-surface`
    : "hidden shrink-0 border-r border-border bg-surface md:block";

  return (
    <aside className={defaultClasses}>
      <div className="flex items-center justify-between border-b border-border px-3 py-4">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <Image
            src="/logo.jpg"
            alt="Falcon Warriors"
            width={32}
            height={32}
            className="rounded-full"
          />
          {!collapsed && (
            <span className="truncate font-display text-sm font-bold text-gold">FALCON WARRIORS</span>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1 text-muted transition hover:bg-surface-2 hover:text-gold md:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                active
                  ? "bg-surface-2 text-gold"
                  : "text-white/80 hover:bg-surface-2 hover:text-gold"
              }`}
            >
              <Icon size={17} />
              {!collapsed && <span>{item.label}</span>}

              {collapsed && (
                <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded-md border border-border bg-bg px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-3 border-t border-border" />

        <Link
          href="/"
          aria-label="Back to Site"
          className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-white ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <ArrowLeft size={17} />
          {!collapsed && <span>Back to Site</span>}

          {collapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded-md border border-border bg-bg px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
              Back to Site
            </span>
          )}
        </Link>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <span className={`rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase text-gold ${collapsed ? "block text-center" : "inline-block"}`}>
          {collapsed ? role.slice(0, 1).toUpperCase() : role}
        </span>
      </div>
    </aside>
  );
}
