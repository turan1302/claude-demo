import * as React from "react";
import { cn } from "@/lib/utils";

/** Dashboard sayfalarının içerik kapsayıcısı — ekran boyutuna göre kenar boşlukları. */
export function PageBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-5 sm:px-6 lg:px-8 lg:py-6", className)} {...props} />;
}
