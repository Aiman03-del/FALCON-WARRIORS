"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, X } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { markAllNotificationsRead } from "@/app/lib/actions/notifications";
import { respondToTeamInvite } from "@/app/lib/actions/teamInvites";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  related_invite_id: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell({ playerId }: { playerId: string | null }) {
  const supabase = createClient();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function loadNotifications(pid: string) {
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, related_invite_id, is_read, created_at")
      .eq("recipient_id", pid)
      .order("created_at", { ascending: false })
      .limit(20);

    setNotifications(data ?? []);
    setUnreadCount((data ?? []).filter((notification) => !notification.is_read).length);
  }

  useEffect(() => {
    if (!playerId) return;
    loadNotifications(playerId);

    const channel = supabase
      .channel(`notifications-${playerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${playerId}` },
        () => loadNotifications(playerId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0 && playerId) {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((previous) => previous.map((notification) => ({ ...notification, is_read: true })));
    }
  }

  async function handleInviteAction(notification: Notification, accept: boolean) {
    if (!notification.related_invite_id) return;
    setLoadingId(notification.id);
    const result = await respondToTeamInvite(notification.related_invite_id, accept);
    setLoadingId(null);
    if (!result.ok) return window.alert(result.error);
    router.refresh();
  }

  if (!playerId) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={handleOpen} className="relative p-2" aria-label="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-white/10 bg-charcoal shadow-xl">
          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 && <p className="p-4 text-center text-sm text-muted">No notifications yet.</p>}
            {notifications.map((notification) => (
              <div key={notification.id} className="mb-1 rounded-lg p-3 hover:bg-white/5">
                <p className="text-sm font-semibold">{notification.title}</p>
                {notification.body && <p className="mt-0.5 text-xs text-muted">{notification.body}</p>}
                {notification.type === "team_invite" && (
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => handleInviteAction(notification, true)} disabled={loadingId === notification.id} className="flex items-center gap-1 rounded-md bg-indigo/20 px-2 py-1 text-xs font-semibold text-indigo-light"><Check size={12} /> Accept</button>
                    <button onClick={() => handleInviteAction(notification, false)} disabled={loadingId === notification.id} className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold"><X size={12} /> Decline</button>
                  </div>
                )}
                <p className="mt-1 text-[10px] text-muted/60">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
