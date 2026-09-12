"use client";

import { Globe, LayoutDashboard, ListChecks, LogOut, Search, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BrandMark } from "@/components/layout/brand-mark";
import { NotificationBell } from "@/components/layout/notification-bell";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sites", label: "Siteler", icon: Globe },
  { href: "/action-items", label: "Aksiyon Maddeleri", icon: ListChecks },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export const SIDEBAR_ICON_BUTTON = "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Logo, arama, menü ve kullanıcı bloğu. Masaüstü sidebar'ı ve mobil menü
 * paneli (MobileNav) ortak kullanır; `onNavigate` panelde bir bağlantıya
 * tıklanınca paneli kapatmak içindir.
 */
export function SidebarContent({ headerActions, onNavigate }: { headerActions?: ReactNode; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      <div className="flex items-center justify-between px-1.5 pb-5 pt-1">
        <BrandMark inverted subtitle="SEO/GEO Paneli" />
        <div className="flex items-center gap-0.5">{headerActions}</div>
      </div>

      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          window.dispatchEvent(new Event("open-command-palette"));
        }}
        className="mb-3 flex items-center gap-2.5 rounded-md border border-sidebar-border bg-white/5 px-2.5 py-2 text-[13px] text-sidebar-muted transition-colors duration-[120ms] hover:bg-sidebar-hover hover:text-sidebar-ink"
      >
        <Search className="h-[15px] w-[15px]" strokeWidth={2} />
        <span className="flex-1 text-left">Ara…</span>
        <kbd className="hidden rounded border border-sidebar-border px-1.5 py-0.5 text-[10px] lg:inline">⌘K</kbd>
      </button>

      <div className="px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-sidebar-muted/80">
        Menü
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-colors duration-[120ms]",
                active
                  ? "bg-sidebar-active text-white before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-sidebar-indicator"
                  : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-ink"
              )}
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user ? (
        <div className="mt-auto flex items-center gap-2.5 border-t border-sidebar-border pt-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-active text-[12px] font-semibold text-sidebar-ink">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-semibold">{user.name}</div>
            <div className="truncate text-[11.5px] text-sidebar-muted">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className={cn("rounded-md p-1.5 transition-colors", SIDEBAR_ICON_BUTTON)}
            aria-label="Çıkış yap"
          >
            <LogOut className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Masaüstü (lg ve üstü) sabit sidebar; daha küçük ekranlarda MobileNav devralır. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-ink lg:block">
      <SidebarContent
        headerActions={
          <>
            <NotificationBell className={SIDEBAR_ICON_BUTTON} />
            <ThemeToggle className={SIDEBAR_ICON_BUTTON} />
          </>
        }
      />
    </aside>
  );
}
