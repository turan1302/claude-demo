"use client";

import { Command } from "cmdk";
import { Globe, LayoutDashboard, ListChecks, Plus, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSites } from "@/hooks/use-sites";

const STATIC_ACTIONS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Siteler", href: "/sites", icon: Globe },
  { label: "Site Ekle", href: "/sites/new", icon: Plus },
  { label: "Aksiyon Maddeleri", href: "/action-items", icon: ListChecks },
  { label: "Ayarlar", href: "/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: sites } = useSites();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpenRequest() {
      setOpen(true);
    }

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpenRequest);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpenRequest);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <Command
        shouldFilter
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-ink-tertiary" strokeWidth={2} />
          <Command.Input
            autoFocus
            placeholder="Site ara veya bir komut yaz…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-tertiary"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-tertiary">ESC</kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-1.5">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-ink-tertiary">Sonuç bulunamadı.</Command.Empty>

          <Command.Group heading="Sayfalar" className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary">
            {STATIC_ACTIONS.map((action) => (
              <Command.Item
                key={action.href}
                onSelect={() => go(action.href)}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink data-[selected=true]:bg-surface-hover"
              >
                <action.icon className="h-[15px] w-[15px] text-ink-tertiary" strokeWidth={2} />
                {action.label}
              </Command.Item>
            ))}
          </Command.Group>

          {sites && sites.length > 0 ? (
            <Command.Group heading="Siteler" className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary">
              {sites.map((site) => (
                <Command.Item
                  key={site.id}
                  value={`${site.name ?? ""} ${site.url}`}
                  onSelect={() => go(`/sites/${site.id}`)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink data-[selected=true]:bg-surface-hover"
                >
                  <Globe className="h-[15px] w-[15px] text-ink-tertiary" strokeWidth={2} />
                  <div className="min-w-0">
                    <div className="truncate">{site.name ?? site.url}</div>
                    <div className="truncate text-[11.5px] text-ink-tertiary">{site.url}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          ) : null}
        </Command.List>
      </Command>
    </div>
  );
}
