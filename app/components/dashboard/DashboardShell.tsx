"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Sidebar from "./Sidebar";

type DashboardShellProps = {
  role: string;
  children: React.ReactNode;
};

export default function DashboardShell({ role, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar
        role={role}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        className={`fixed inset-y-0 left-0 z-50 transform border-r border-border bg-surface transition-all duration-300 md:sticky md:top-0 md:h-screen md:overflow-hidden md:translate-x-0 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-white transition hover:border-gold hover:text-gold"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-sm font-bold text-gold">Dashboard</span>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-white transition hover:border-gold hover:text-gold md:inline-flex"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="hidden border-b border-border bg-bg px-4 py-3 md:flex md:justify-end">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-white transition hover:border-gold hover:text-gold"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <main className="p-6 md:p-10">{children}</main>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
}
