import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  trend?: { value: string; positive?: boolean };
  tone?: 'default' | 'blue' | 'amber' | 'red' | 'green';
}

const TONE_CLASS: Record<NonNullable<Props['tone']>, string> = {
  default: 'text-foreground bg-muted',
  blue: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950',
  amber: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950',
  red: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950',
  green: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950',
};

export function KpiCard({ label, value, icon: Icon, href, trend, tone = 'default' }: Props) {
  const inner = (
    <Card className="group relative overflow-hidden p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-dd-terracota">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs',
                trend.positive ? 'text-emerald-600' : 'text-muted-foreground',
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-2', TONE_CLASS[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
