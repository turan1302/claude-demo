"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CategoryPill } from "@/components/ui/badges";
import { StaggerItem, StaggerList } from "@/components/ui/stagger-list";
import { actionStatusLabels, impactLabels, priorityLabels, priorityTextColors } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { ActionItem, ActionItemStatus } from "@/types/api";

const COLUMNS: { status: ActionItemStatus; dot: string }[] = [
  { status: "pending", dot: "bg-ink-tertiary" },
  { status: "in_progress", dot: "bg-accent" },
  { status: "completed", dot: "bg-good" },
];

function containerOf(id: number | string, list: ActionItem[]): ActionItemStatus | undefined {
  if (COLUMNS.some((c) => c.status === id)) return id as ActionItemStatus;
  return list.find((i) => i.id === id)?.status;
}

/** Sürüklenen kartı `overId`nin hemen önüne (ya da hedef sütunun sonuna) taşır. */
function moveItemToContainer(
  list: ActionItem[],
  activeId: number,
  overId: number | string,
  overStatus: ActionItemStatus
): ActionItem[] {
  const activeIndex = list.findIndex((i) => i.id === activeId);
  if (activeIndex === -1) return list;

  const moved = { ...list[activeIndex], status: overStatus };
  const rest = list.filter((i) => i.id !== activeId);

  const overCardIndex = rest.findIndex((i) => i.id === overId);
  let insertAt: number;
  if (overCardIndex !== -1) {
    insertAt = overCardIndex;
  } else {
    const lastOfStatusIndex = rest.reduce((last, cur, idx) => (cur.status === overStatus ? idx : last), -1);
    insertAt = lastOfStatusIndex === -1 ? rest.length : lastOfStatusIndex + 1;
  }

  return [...rest.slice(0, insertAt), moved, ...rest.slice(insertAt)];
}

function KanbanCardBody({ item, className }: { item: ActionItem; className?: string }) {
  const done = item.status === "completed";

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border border-l-[3px] border-border bg-surface p-3.5",
        done && "opacity-60",
        className
      )}
      data-priority={item.priority}
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryPill category={item.category} />
        {done ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-good">
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <div className={cn("text-[13.5px] font-semibold leading-snug", done && "text-ink-tertiary line-through")}>
        {item.title}
      </div>
      {item.site ? (
        <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
          <Globe className="h-2.5 w-2.5" strokeWidth={2.5} />
          {item.site.name ?? item.site.url}
        </div>
      ) : null}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-[11px] font-bold text-ink-tertiary">{impactLabels[item.estimated_impact]}</span>
        <span className={cn("text-[11px] font-bold", priorityTextColors[item.priority])}>{priorityLabels[item.priority]}</span>
      </div>
    </div>
  );
}

function KanbanCard({ item }: { item: ActionItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Transform.toString(transform), transition: transition ?? undefined }}
      className={cn("cursor-grab touch-none transition-opacity duration-[120ms] active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <KanbanCardBody item={item} className="transition-[border-color] duration-[120ms] hover:border-l-accent/60" />
    </div>
  );
}

function KanbanColumn({ status, dot, items }: { status: ActionItemStatus; dot: string; items: ActionItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const ids = items.map((i) => i.id);

  return (
    <div>
      <div className="flex items-center gap-2 px-1 pb-3.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
        <span className="text-[12.5px] font-bold uppercase tracking-wide text-ink-secondary">{actionStatusLabels[status]}</span>
        <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-semibold text-ink-tertiary">{items.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-col gap-2.5 rounded-lg p-1 transition-colors duration-[120ms]",
          isOver && "bg-accent/8"
        )}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <StaggerList className="flex flex-col gap-2.5">
            {items.map((item) => (
              <StaggerItem key={item.id}>
                <KanbanCard item={item} />
              </StaggerItem>
            ))}
          </StaggerList>
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({
  items,
  onReorder,
}: {
  items: ActionItem[];
  onReorder: (item: ActionItem, status: ActionItemStatus, position: number) => void;
}) {
  const [localItems, setLocalItems] = useState<ActionItem[]>(items);
  const [activeItem, setActiveItem] = useState<ActionItem | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!draggingRef.current) setLocalItems(items);
  }, [items]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart(event: DragStartEvent) {
    draggingRef.current = true;
    setActiveItem(localItems.find((i) => i.id === event.active.id) ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalItems((prev) => {
      const activeStatus = containerOf(active.id, prev);
      const overStatus = containerOf(over.id, prev);
      if (!activeStatus || !overStatus || activeStatus === overStatus) return prev;

      return moveItemToContainer(prev, active.id as number, over.id, overStatus);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    draggingRef.current = false;
    setActiveItem(null);

    const { active, over } = event;
    if (!over) return;

    const originalItem = items.find((i) => i.id === active.id);
    if (!originalItem) return;

    setLocalItems((prev) => {
      const activeIndex = prev.findIndex((i) => i.id === active.id);
      if (activeIndex === -1) return prev;

      const overStatus = containerOf(over.id, prev) ?? prev[activeIndex].status;

      let next = prev;
      if (active.id !== over.id) {
        const overIndex = prev.findIndex((i) => i.id === over.id);
        if (overIndex !== -1 && overIndex !== activeIndex) {
          next = arrayMove(prev, activeIndex, overIndex);
        }
      }

      if (next === prev && overStatus === originalItem.status) {
        return prev; // Aynı yere bırakıldı, hiçbir şey değişmedi.
      }

      const columnItems = next.filter((i) => i.status === overStatus);
      const finalIndex = columnItems.findIndex((i) => i.id === active.id);
      const prevNeighbor = columnItems[finalIndex - 1];
      const nextNeighbor = columnItems[finalIndex + 1];

      let position: number;
      if (!prevNeighbor && !nextNeighbor) position = 0;
      else if (!prevNeighbor) position = nextNeighbor.position - 1;
      else if (!nextNeighbor) position = prevNeighbor.position + 1;
      else position = (prevNeighbor.position + nextNeighbor.position) / 2;

      onReorder(originalItem, overStatus, position);
      return next;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.status} status={col.status} dot={col.dot} items={localItems.filter((i) => i.status === col.status)} />
        ))}
      </div>
      <DragOverlay>{activeItem ? <KanbanCardBody item={activeItem} className="rotate-1 shadow-xl" /> : null}</DragOverlay>
    </DndContext>
  );
}
