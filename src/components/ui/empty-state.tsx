import * as React from 'react';
import { cn } from 'cn';
import type { LucideIcon } from 'lucide-react';

function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'text-muted-foreground flex flex-col items-center justify-center gap-1.5 px-4 py-10 text-center',
        className
      )}
      {...props}
    >
      {Icon && (
        <span className="bg-muted text-muted-foreground mb-1 flex size-10 items-center justify-center rounded-full">
          <Icon className="size-5" />
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-xs">{description}</p>}
    </div>
  );
}

export { EmptyState };