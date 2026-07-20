"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

type DashboardShellProps = {
  role: string;
  children: React.ReactNode;
};

export default function DashboardShell({ role, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        role={role}
        onClose={() => setSidebarOpen(false)}
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-surface transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      />

      <div className="flex-1">
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
          <div className="w-10" />
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
