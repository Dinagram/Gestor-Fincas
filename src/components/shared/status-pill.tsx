import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import {
  ISSUE_PRIORITY_LABEL,
  ISSUE_STATUS_LABEL,
} from '@/lib/constants';
import type { Database } from '@/types/database';

type IssueStatus = Database['public']['Tables']['issues']['Row']['status'];
type IssuePriority = Database['public']['Tables']['issues']['Row']['priority'];

const statusVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        // Neutros calentados a la paleta DD² (taupe/beige/tinta)
        slate: 'border-dd-taupe/25 bg-dd-beige text-dd-tinta dark:border-dd-beige/15 dark:bg-dd-bronce dark:text-dd-beige',
        zinc:  'border-dd-taupe/20 bg-dd-papel text-dd-taupe dark:border-dd-beige/10 dark:bg-dd-bronce/70 dark:text-dd-beige/80',
        // Tonos funcionales (significado de estado/urgencia) — se mantienen
        blue:  'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
        amber: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
        green: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
        red:   'border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
      },
    },
    defaultVariants: { tone: 'slate' },
  },
);

const STATUS_TONE: Record<IssueStatus, VariantProps<typeof statusVariants>['tone']> = {
  abierta: 'blue',
  en_revision: 'amber',
  en_curso: 'blue',
  resuelta: 'green',
  cerrada: 'zinc',
  descartada: 'zinc',
};

const PRIORITY_TONE: Record<IssuePriority, VariantProps<typeof statusVariants>['tone']> = {
  baja: 'slate',
  media: 'blue',
  alta: 'amber',
  urgente: 'red',
};

export function IssueStatusPill({ status, className }: { status: IssueStatus; className?: string }) {
  return (
    <span className={cn(statusVariants({ tone: STATUS_TONE[status] }), className)}>
      <span className="status-dot bg-current" aria-hidden />
      {ISSUE_STATUS_LABEL[status]}
    </span>
  );
}

export function IssuePriorityPill({
  priority,
  className,
}: {
  priority: IssuePriority;
  className?: string;
}) {
  return (
    <span className={cn(statusVariants({ tone: PRIORITY_TONE[priority] }), className)}>
      {ISSUE_PRIORITY_LABEL[priority]}
    </span>
  );
}
