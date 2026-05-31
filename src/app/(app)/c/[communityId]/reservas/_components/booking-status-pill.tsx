import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import {
  BOOKING_KIND_LABEL,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
} from '@/lib/constants';

import type { BookingKind, BookingStatus } from '../_lib/types';

const pill = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        slate: 'border-dd-taupe/25 bg-dd-beige text-dd-tinta dark:border-dd-beige/15 dark:bg-dd-bronce dark:text-dd-beige',
        zinc: 'border-dd-taupe/20 bg-dd-papel text-dd-taupe dark:border-dd-beige/10 dark:bg-dd-bronce/70 dark:text-dd-beige/80',
        blue: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
        amber: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
        green: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
        red: 'border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
      },
    },
    defaultVariants: { tone: 'slate' },
  },
);

type Tone = VariantProps<typeof pill>['tone'];

export function BookingStatusPill({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span className={cn(pill({ tone: BOOKING_STATUS_TONE[status] as Tone }), className)}>
      <span className="status-dot bg-current" aria-hidden />
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}

const KIND_TONE: Record<BookingKind, Tone> = {
  vecino: 'slate',
  comunidad: 'blue',
  bloqueo: 'zinc',
};

export function BookingKindPill({
  kind,
  className,
}: {
  kind: BookingKind;
  className?: string;
}) {
  if (kind === 'vecino') return null;
  return (
    <span className={cn(pill({ tone: KIND_TONE[kind] }), className)}>
      {BOOKING_KIND_LABEL[kind]}
    </span>
  );
}
