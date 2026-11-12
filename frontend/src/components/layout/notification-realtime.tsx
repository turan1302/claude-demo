"use client";

import { useNotificationRealtime } from "@/hooks/use-notifications";

/**
 * Bildirim realtime aboneliğini dashboard başına TEK sefer kurar.
 * NotificationBell hem mobil barda hem masaüstü sidebar'ında render
 * edildiği için abonelik orada kurulsaydı iki kez açılırdı.
 */
export function NotificationRealtime() {
  useNotificationRealtime();
  return null;
}
