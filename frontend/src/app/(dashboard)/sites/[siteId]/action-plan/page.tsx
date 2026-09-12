"use client";

import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { KanbanBoard } from "@/components/action-plan/kanban-board";
import { PageHeader } from "@/components/layout/page-header";
import { useActionPlan } from "@/hooks/use-analysis";
import { useSite } from "@/hooks/use-sites";
import { useReorderActionItem } from "@/hooks/use-action-items";
import { actionStatusLabels } from "@/lib/labels";

export default function SiteActionPlanPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const id = Number(siteId);

  const { data: site } = useSite(id);
  const analysisId = site?.latest_analysis?.id;
  const { data: plan, isLoading } = useActionPlan(analysisId);
  const reorderItem = useReorderActionItem();

  return (
    <div>
      <PageHeader breadcrumb={<Link href={`/sites/${id}`}>{site?.name ?? "Site"}</Link>} title="Aksiyon Planı" />

      <div className="px-8 py-6">
        {isLoading ? (
          <div className="text-sm text-ink-tertiary">Yükleniyor…</div>
        ) : plan && plan.items.length > 0 ? (
          <KanbanBoard
            items={plan.items}
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
          <div className="text-sm text-ink-tertiary">Bu site için henüz bir aksiyon planı oluşturulmadı.</div>
        )}
      </div>
    </div>
  );
}
