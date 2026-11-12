"use client";

import { motion } from "motion/react";
import { EASE_SNAPPY } from "@/lib/motion";

/**
 * App Router segment değişiminde AnimatePresence tabanlı exit animasyonu
 * native navigasyonla çakıştığı için sade, güvenilir bir "enter-only"
 * fade + kısa slide kullanılıyor (Linear'daki gibi hızlı ve kesin).
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: EASE_SNAPPY }}
    >
      {children}
    </motion.div>
  );
}
