"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SIDEBAR_ICON_BUTTON, SidebarContent } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const ICON_BUTTON = cn("flex h-9 w-9 items-center justify-center rounded-md transition-colors", SIDEBAR_ICON_BUTTON);

/** lg altı ekranlar (telefon/tablet) için üst bar + soldan açılan menü paneli. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  // Panel açıkken pencere masaüstü genişliğine büyütülürse panel CSS ile
  // gizlenir ama Dialog'un sayfa kaydırma kilidi kalırdı — kapatıyoruz.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-3 text-sidebar-ink lg:hidden">
        <BrandMark inverted />
        <div className="flex items-center gap-0.5">
          <NotificationBell align="end" className={SIDEBAR_ICON_BUTTON} />
          <Dialog.Trigger asChild>
            <button type="button" className={ICON_BUTTON} aria-label="Menüyü aç">
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </Dialog.Trigger>
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-sidebar text-sidebar-ink shadow-2xl outline-none data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in lg:hidden"
        >
          <Dialog.Title className="sr-only">Menü</Dialog.Title>
          <SidebarContent
            onNavigate={() => setOpen(false)}
            headerActions={
              <>
                <ThemeToggle className={SIDEBAR_ICON_BUTTON} />
                <Dialog.Close asChild>
                  <button type="button" className={ICON_BUTTON} aria-label="Menüyü kapat">
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </Dialog.Close>
              </>
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
