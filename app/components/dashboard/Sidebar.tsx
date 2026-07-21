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
} from "lucide-react";

export const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Matches", href: "/dashboard/matches", icon: Swords },
  { label: "Tournaments", href: "/dashboard/tournaments", icon: Trophy },
  { label: "Achievements", href: "/dashboard/achievements", icon: Award },
  { label: "Ballon d'Or", href: "/dashboard/ballon-dor", icon: Star },
  { label: "News", href: "/dashboard/news", icon: Newspaper },
  { label: "Gallery", href: "/dashboard/gallery", icon: ImageIcon },
];

type DashboardSidebarProps = {
  role: string;
  className?: string;
  onClose?: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardSidebar({ role, className = "", onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const defaultClasses = className
    ? `${className} w-64 shrink-0 border-r border-border bg-surface`
    : "hidden w-64 shrink-0 border-r border-border bg-surface md:block";

  return (
    <aside className={defaultClasses}>
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <Image
          src="/logo.jpg"
          alt="Falcon Warriors"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="font-display text-sm font-bold text-gold">FALCON WARRIORS</span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-surface-2 text-gold"
                  : "text-white/80 hover:bg-surface-2 hover:text-gold"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-border" />

        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Site
        </Link>
      </nav>

      <div className="absolute bottom-4 left-4">
        <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase text-gold">
          {role}
        </span>
      </div>
    </aside>
  );
}
