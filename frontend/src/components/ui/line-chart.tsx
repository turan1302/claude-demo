"use client";

import { motion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { EASE_SNAPPY } from "@/lib/motion";

export interface LineChartPoint {
  label: string;
  value: number;
}

/**
 * El yapımı, tam kontrollü SVG çizgi grafiği — skor geçmişi ve anahtar
 * kelime sıralama trendi için. `value` her zaman "yukarı = iyi" varsayar;
 * sıralama (rank) gibi "düşük = iyi" veriler için çağıran taraf
 * `value: -position` göndermeli, `formatValue` ile gerçek değeri gösterir.
 */
export function LineChart({
  data,
  height = 160,
  color = "var(--color-accent)",
  formatValue = (value) => String(value),
}: {
  data: LineChartPoint[];
  height?: number;
  color?: string;
  formatValue?: (value: number) => string;
}) {
  const width = 600;
  const padding = 12;
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * (width - padding * 2) + padding : width / 2;
      const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
      return { x, y, ...d };
    });
  }, [data, height]);

  if (data.length === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-ink-tertiary">Henüz veri yok.</div>;
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const hitWidth = width / data.length;

  return (
    <div className="relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path d={areaPath} fill={`url(#${gradientId})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.3 }} />
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: EASE_SNAPPY }}
        />

        {hovered ? <circle cx={hovered.x} cy={hovered.y} r={4} fill={color} /> : null}

        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - hitWidth / 2}
            y={0}
            width={hitWidth}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>

      {hovered ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: `${(hovered.x / width) * 100}%`, top: `${(hovered.y / height) * 100}%` }}
        >
          <div className="font-semibold tabular-nums">{formatValue(hovered.value)}</div>
          <div className="text-ink-tertiary">{hovered.label}</div>
        </div>
      ) : null}
    </div>
  );
}
