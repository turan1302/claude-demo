"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full bg-surface-hover border border-border transition-colors duration-[120ms] data-[state=checked]:bg-accent data-[state=checked]:border-accent disabled:opacity-50"
      )}
    >
      <SwitchPrimitive.Thumb className="block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-white transition-transform duration-[120ms] data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}
