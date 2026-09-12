import { cn } from "@/lib/utils";

const SIZES = {
  sm: { mark: "h-7 w-7 rounded-md text-[14px]", name: "text-[15px]" },
  md: { mark: "h-9 w-9 rounded-lg text-[17px]", name: "text-[19px]" },
};

/**
 * Ufuk logosu (monogram + isim). `inverted` lacivert zeminler (sidebar)
 * içindir: monogram beyaz kutuya, lacivert harfe döner. İsim rengi
 * çağıran taraftan (currentColor) miras alınır.
 */
export function BrandMark({
  size = "sm",
  inverted = false,
  subtitle,
  className,
}: {
  size?: keyof typeof SIZES;
  inverted?: boolean;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center font-bold tracking-tight",
          SIZES[size].mark,
          inverted ? "bg-white text-sidebar" : "bg-sidebar text-white ring-1 ring-inset ring-white/10"
        )}
      >
        U
      </div>
      <div className="leading-tight">
        <div className={cn("font-semibold tracking-tight", SIZES[size].name)}>Ufuk</div>
        {subtitle ? <div className="text-[11px] font-medium opacity-70">{subtitle}</div> : null}
      </div>
    </div>
  );
}
