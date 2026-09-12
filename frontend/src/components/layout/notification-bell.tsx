"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell } from "lucide-react";
import Link from "next/link";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationRealtime,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "az önce";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}sa önce`;
  return `${Math.floor(hours / 24)}g önce`;
}

export function NotificationBell() {
  useNotificationRealtime();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-hover hover:text-ink"
          aria-label="Bildirimler"
        >
          <Bell className="h-[15px] w-[15px]" strokeWidth={2} />
          {unreadCount ? (
            <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-bad text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 w-80 rounded-lg border border-border bg-surface p-1.5 shadow-lg"
        >
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-[12.5px] font-semibold">Bildirimler</span>
            {unreadCount ? (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="text-[11.5px] font-semibold text-accent hover:underline"
              >
                Tümünü okundu işaretle
              </button>
            ) : null}
          </div>

          {notifications && notifications.length > 0 ? (
            <div className="flex max-h-96 flex-col overflow-y-auto">
              {notifications.map((n) => (
                <DropdownMenu.Item key={n.id} asChild>
                  <Link
                    href={`/sites/${n.data.site_id}/analyses/${n.data.analysis_id}`}
                    onClick={() => {
                      if (!n.read_at) markRead.mutate(n.id);
                    }}
                    className={cn(
                      "flex flex-col gap-0.5 rounded-md px-2.5 py-2 text-[12.5px] outline-none transition-colors hover:bg-surface-hover",
                      !n.read_at && "bg-accent/6"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {!n.read_at ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> : null}
                      <span className="font-medium">{n.data.message}</span>
                    </div>
                    <span className="text-[11px] text-ink-tertiary">{timeAgo(n.created_at)}</span>
                  </Link>
                </DropdownMenu.Item>
              ))}
            </div>
          ) : (
            <div className="px-2.5 py-6 text-center text-[12.5px] text-ink-tertiary">Henüz bildirim yok.</div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
