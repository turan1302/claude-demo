import { CommandPalette } from "@/components/layout/command-palette";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationRealtime } from "@/components/layout/notification-realtime";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg lg:flex-row">
      <MobileNav />
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
      <CommandPalette />
      <NotificationRealtime />
    </div>
  );
}
