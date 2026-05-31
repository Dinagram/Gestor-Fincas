'use client';

import { useState } from 'react';
import { Grid3X3, LayoutList, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DirectoryEntry } from '../page';

import { FloorPlan } from './floor-plan';
import { MembersTable } from './members-table';

type ViewMode = 'tabla' | 'plano';
type FilterKey = 'todos' | 'propietarios' | 'inquilinos' | 'vacías';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'propietarios', label: 'Propietarios' },
  { key: 'inquilinos', label: 'Inquilinos' },
  { key: 'vacías', label: 'Vacías' },
];

interface Props {
  entries: DirectoryEntry[];
  canSeeContact: boolean;
}

export function DirectoryView({ entries, canSeeContact }: Props) {
  const [view, setView] = useState<ViewMode>('tabla');
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [search, setSearch] = useState('');

  const filtered = entries
    .filter((e) => {
      if (filter === 'propietarios')
        return ['propietario', 'junta', 'admin_finca'].includes(e.memberRole ?? '');
      if (filter === 'inquilinos') return e.memberRole === 'inquilino';
      if (filter === 'vacías') return e.memberId === null;
      return true;
    })
    .filter((e) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        e.fullName?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        `${e.floor}${e.door}`.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === f.key
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar vecino…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 pl-8 text-sm"
            />
          </div>

          <div className="flex rounded-lg border bg-muted/50 p-0.5">
            <button
              onClick={() => setView('tabla')}
              aria-label="Vista tabla"
              className={cn(
                'rounded-md p-1.5 transition-colors',
                view === 'tabla'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('plano')}
              aria-label="Vista plano"
              className={cn(
                'rounded-md p-1.5 transition-colors',
                view === 'plano'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron vecinos con ese filtro.
          </p>
        </div>
      ) : view === 'tabla' ? (
        <MembersTable entries={filtered} canSeeContact={canSeeContact} />
      ) : (
        <FloorPlan entries={filtered} />
      )}
    </div>
  );
}
