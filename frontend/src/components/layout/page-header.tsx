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
    <div className="flex flex-col gap-1.5 border-b border-border bg-surface px-8 py-5">
      {breadcrumb ? <div className="text-[12.5px] font-medium text-ink-tertiary">{breadcrumb}</div> : null}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">{title}</h1>
          {description ? <p className="mt-0.5 text-[12.5px] text-ink-tertiary">{description}</p> : null}
        </div>
        {actions}
      </div>
    </div>
  );
}
