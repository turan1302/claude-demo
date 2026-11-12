"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KanbanBoard } from "@/components/action-plan/kanban-board";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { useActionItems, useReorderActionItem } from "@/hooks/use-action-items";
import { actionStatusLabels, categoryLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { FindingCategory } from "@/types/api";

const FILTERS: { value: FindingCategory | "all"; label: string }[] = [
  { value: "all", label: "Tüm Kategoriler" },
  { value: "seo", label: categoryLabels.seo },
  { value: "geo", label: categoryLabels.geo },
  { value: "technical", label: categoryLabels.technical },
  { value: "content", label: categoryLabels.content },
];

export default function ActionItemsPage() {
  const [category, setCategory] = useState<FindingCategory | "all">("all");
  const { data: items, isLoading } = useActionItems(category === "all" ? {} : { category });
  const reorderItem = useReorderActionItem();

  return (
    <div>
      <PageHeader
        title="Aksiyon Maddeleri"
        actions={
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setCategory(filter.value)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-[120ms]",
                  category === filter.value
                    ? "border-accent/40 bg-accent/12 text-accent"
                    : "border-border bg-surface text-ink-secondary hover:bg-surface-hover"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        }
      />

      <PageBody>
        {isLoading ? (
          <div className="text-sm text-ink-tertiary">Yükleniyor…</div>
        ) : items && items.length > 0 ? (
          <KanbanBoard
            items={items}
            onReorder={(item, status, position) =>
              reorderItem.mutate(
                { id: item.id, position, status: status !== item.status ? status : undefined },
                status !== item.status
                  ? { onSuccess: () => toast.success(`"${item.title}" → ${actionStatusLabels[status]}`) }
                  : undefined
              )
            }
          />
        ) : (
          <div className="text-sm text-ink-tertiary">Bu filtrede aksiyon maddesi yok.</div>
        )}
      </PageBody>
    </div>
  );
}
