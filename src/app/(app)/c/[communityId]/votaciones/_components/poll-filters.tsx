'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';

const FILTERS = [
  { key: 'todas', label: 'Todas' },
  { key: 'active', label: 'Activas' },
  { key: 'draft', label: 'Borradores' },
  { key: 'closed', label: 'Cerradas' },
  { key: 'cancelled', label: 'Canceladas' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

interface Props {
  counts?: Partial<Record<FilterKey, number>>;
  showDraft?: boolean;
}

export function PollFilters({ counts, showDraft = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = (searchParams.get('estado') as FilterKey | null) ?? 'todas';

  function navigate(key: FilterKey) {
    const params = new URLSearchParams();
    if (key !== 'todas') params.set('estado', key);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
  }

  const visible = showDraft ? FILTERS : FILTERS.filter((f) => f.key !== 'draft');

  return (
    <div role="tablist" aria-label="Filtrar votaciones" className="flex flex-wrap gap-2">
      {visible.map((f) => {
        const isActive = active === f.key;
        const count = counts?.[f.key];
        return (
          <button
            key={f.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => navigate(f.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {f.label}
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
