'use client';

import { cn } from '@/lib/utils';
import { ROLE_LABEL } from '@/lib/constants';
import type { DirectoryEntry } from '../page';

interface Props {
  entries: DirectoryEntry[];
}

function sortFloors(floors: string[]): string[] {
  return [...floors].sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return b.localeCompare(a);
  });
}

const UNIT_TYPE_LABEL: Record<string, string> = {
  vivienda: 'Vivienda',
  local: 'Local',
  garaje: 'Garaje',
  trastero: 'Trastero',
};

export function FloorPlan({ entries }: Props) {
  const byFloor = new Map<string, DirectoryEntry[]>();
  for (const entry of entries) {
    if (!byFloor.has(entry.floor)) byFloor.set(entry.floor, []);
    byFloor.get(entry.floor)!.push(entry);
  }

  const floors = sortFloors([...byFloor.keys()]);

  if (floors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">Sin unidades para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {floors.map((floor) => {
        const units = byFloor.get(floor)!.sort((a, b) => a.door.localeCompare(b.door));
        return (
          <div key={floor} className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b bg-muted/50 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Planta {floor}
              </span>
              <span className="ml-2 text-xs text-muted-foreground/60">
                {units.length} {units.length === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {units.map((entry) => (
                <div
                  key={entry.unitId}
                  className={cn(
                    'flex flex-col gap-1.5 rounded-lg border p-3 transition-colors',
                    entry.memberId
                      ? 'border-border bg-card hover:bg-muted/30'
                      : 'border-dashed border-muted-foreground/25 bg-muted/20',
                  )}
                >
                  <div className="font-mono text-xs font-semibold tracking-wide text-muted-foreground">
                    {entry.floor}
                    {entry.door}
                  </div>
                  <div className="text-sm font-medium leading-tight">
                    {entry.fullName ?? (
                      <span className="font-normal text-muted-foreground">Vacía</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.memberRole
                      ? ROLE_LABEL[entry.memberRole]
                      : UNIT_TYPE_LABEL[entry.unitType] ?? entry.unitType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
