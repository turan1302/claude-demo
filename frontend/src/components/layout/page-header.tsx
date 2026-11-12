import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border bg-surface px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
      {breadcrumb ? <div className="text-[12.5px] font-medium text-ink-tertiary">{breadcrumb}</div> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-[18px] font-semibold tracking-tight sm:text-[20px]">{title}</h1>
          {description ? <p className="mt-0.5 break-words text-[12.5px] text-ink-tertiary">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
