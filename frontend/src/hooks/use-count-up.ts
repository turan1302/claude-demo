"use client";

import { animate, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_SNAPPY } from "@/lib/motion";

/**
 * Bir sayının hedef değere kısa, keskin bir animasyonla ("count-up")
 * ulaşmasını sağlar — dashboard istatistik kartları ve skor göstergeleri
 * için kullanılır.
 */
export function useCountUp(target: number, duration = 0.6): number {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, target, { duration, ease: EASE_SNAPPY });
    const unsubscribe = motionValue.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      controls.stop();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}
