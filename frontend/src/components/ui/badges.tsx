import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categoryColors,
  categoryLabels,
  scoreTone,
  siteStatusLabels,
} from "@/lib/labels";
import type { FindingCategory, SiteStatus } from "@/types/api";

const toneClasses = {
  good: "bg-good/12 text-good",
  warn: "bg-warn/12 text-warn",
  bad: "bg-bad/12 text-bad",
};

export function ScoreChip({ label, score }: { label: string; score: number | null }) {
  const tone = scoreTone(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        toneClasses[tone]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "currentColor" }} />
      {label} {score ?? "—"}
    </span>
  );
}

export function CategoryPill({ category }: { category: FindingCategory }) {
  const colors = categoryColors[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
        colors.bg,
        colors.text
      )}
    >
      {categoryLabels[category]}
    </span>
  );
}

export function SiteStatusPill({ status }: { status: SiteStatus }) {
  if (status === "analyzing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-1 text-[11.5px] font-semibold text-accent">
        <Loader2 className="h-3 w-3 animate-spin" />
        {siteStatusLabels[status]}
      </span>
    );
  }

  const tone: Record<SiteStatus, string> = {
    pending: "bg-surface-hover text-ink-secondary",
    analyzing: "",
    analyzed: "bg-surface-hover text-ink-secondary",
    error: "bg-bad/12 text-bad",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold", tone[status])}>
      {siteStatusLabels[status]}
    </span>
  );
}
