import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        // text-base (16px) mobilde: iOS Safari 16px altı input'a odaklanınca sayfayı yakınlaştırıyor.
        "h-9 w-full rounded-md border border-border bg-surface px-3 text-base text-ink sm:text-sm placeholder:text-ink-tertiary transition-colors duration-[120ms] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-ink-secondary", className)} {...props} />;
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-[12.5px] font-medium text-bad">{children}</p>;
}
