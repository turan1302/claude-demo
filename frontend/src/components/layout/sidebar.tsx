"use client";

import { Globe, LayoutDashboard, ListChecks, LogOut, Search, Settings, Sparkle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sites", label: "Siteler", icon: Globe },
  { href: "/action-items", label: "Aksiyon Maddeleri", icon: ListChecks },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-border bg-surface p-3">
      <div className="flex items-center justify-between px-2 pb-6 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
            <Sparkle className="h-3.5 w-3.5 text-white" strokeWidth={2.4} />
          </div>
          <span className="text-[14px] font-semibold tracking-tight">Ufuk</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
        className="mb-2 flex items-center gap-2.5 rounded-md border border-border px-2.5 py-2 text-[13px] text-ink-tertiary transition-colors duration-[120ms] hover:bg-surface-hover hover:text-ink"
      >
        <Search className="h-[15px] w-[15px]" strokeWidth={2} />
        <span className="flex-1 text-left">Ara…</span>
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-colors duration-[120ms]",
                active ? "bg-accent/12 text-accent" : "text-ink-secondary hover:bg-surface-hover hover:text-ink"
              )}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user ? (
        <div className="mt-auto flex items-center gap-2.5 border-t border-border pt-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[12px] font-semibold text-ink-secondary">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-semibold">{user.name}</div>
            <div className="truncate text-[11.5px] text-ink-tertiary">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-hover hover:text-ink"
            aria-label="Çıkış yap"
          >
            <LogOut className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
      ) : null}
    </aside>
  );
}
