'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';

const FILTERS = [
  { key: 'todas', label: 'Todas' },
  { key: 'sin_leer', label: 'Sin leer' },
  { key: 'urgente', label: 'Urgente' },
  { key: 'convocatoria', label: 'Convocatoria' },
  { key: 'resolucion', label: 'Resolución' },
  { key: 'aviso', label: 'Aviso' },
  { key: 'acuse', label: 'Acuse pendiente' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

interface Props {
  counts?: Partial<Record<FilterKey, number>>;
}

export function AnnouncementFilters({ counts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active: FilterKey =
    (searchParams.get('sin_leer') === '1' ? 'sin_leer' : null) ??
    (searchParams.get('acuse') === '1' ? 'acuse' : null) ??
    ((searchParams.get('tipo') as FilterKey | null) ?? 'todas');

  function navigate(key: FilterKey) {
    const params = new URLSearchParams();
    if (key === 'sin_leer') params.set('sin_leer', '1');
    else if (key === 'acuse') params.set('acuse', '1');
    else if (key !== 'todas') params.set('tipo', key);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
  }

  return (
    <div
      role="tablist"
      aria-label="Filtrar comunicados"
      className="flex flex-wrap gap-2"
    >
      {FILTERS.map((f) => {
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
