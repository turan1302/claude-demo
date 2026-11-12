import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ufuk — SEO/GEO Yönetim Paneli",
  description: "Siteleriniz için otomatik SEO ve GEO analizi, önceliklendirilmiş aksiyon planı.",
};

// Mobil tarayıcı çubuğu lacivert üst barla aynı renkte görünsün
// (width=device-width, initial-scale=1 Next tarafından zaten ekleniyor).
export const viewport: Viewport = {
  themeColor: "#0f1f3d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`h-full ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-ink)",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
