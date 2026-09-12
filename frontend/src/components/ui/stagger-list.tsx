"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { EASE_SNAPPY } from "@/lib/motion";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_SNAPPY } },
};

/**
 * Site kartları, aksiyon maddeleri, bulgu satırları gibi liste görünümlerinin
 * sayfa açılışında kısa aralıklarla ("Linear tarzı") belirmesi için.
 */
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={listVariants} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
