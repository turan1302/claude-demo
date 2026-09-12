"use client";

import { motion } from "motion/react";
import { useCountUp } from "@/hooks/use-count-up";
import { scoreTone } from "@/lib/labels";
import { EASE_SNAPPY } from "@/lib/motion";

const STROKE_COLORS = { good: "#3dd68c", warn: "#f5a623", bad: "#f65656" } as const;

function AnimatedNumber({ value }: { value: number }) {
  return <>{useCountUp(value)}</>;
}

export function ScoreGauge({ score, size = 108 }: { score: number | null; size?: number }) {
  const tone = scoreTone(score);
  const strokeColor = STROKE_COLORS[tone];
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = score !== null ? (circumference * score) / 100 : 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${filled} ${circumference}` }}
          transition={{ duration: 0.6, ease: EASE_SNAPPY }}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-bold tabular-nums"
        style={{ color: strokeColor, fontSize: size * 0.24 }}
      >
        {score !== null ? <AnimatedNumber value={score} /> : "—"}
      </div>
    </div>
  );
}
