"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

/** `className` verilirse varsayılan renk/hover sınıflarının yerine geçer. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // Sunucuda/hidrasyonda false, istemcide true — tema yalnızca istemcide
  // bilindiği için hidrasyon uyuşmazlığını önler.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        className ?? "text-ink-tertiary hover:bg-surface-hover hover:text-ink"
      )}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      {isDark ? <Sun className="h-[15px] w-[15px]" strokeWidth={2} /> : <Moon className="h-[15px] w-[15px]" strokeWidth={2} />}
    </button>
  );
}
