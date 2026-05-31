'use client';

import { cn } from '@/lib/utils';
import { ROLE_LABEL } from '@/lib/constants';
import type { DirectoryEntry } from '../page';

const ROLE_BADGE: Record<string, string> = {
  propietario:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300',
  inquilino:
    'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400',
  junta:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300',
  admin_finca:
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/60 dark:text-orange-300',
};

interface Props {
  entries: DirectoryEntry[];
  canSeeContact: boolean;
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function MembersTable({ entries, canSeeContact }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Unidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Vecino
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tipo
              </th>
              {canSeeContact && (
                <>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
                    Email
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
                    Teléfono
                  </th>
                </>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map((entry) => (
              <tr key={entry.unitId} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums">
                  {entry.floor}
                  {entry.door}
                </td>
                <td className="px-4 py-3">
                  {entry.fullName ? (
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground">
                        {initials(entry.fullName)}
                      </div>
                      <span className="font-medium">{entry.fullName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {entry.memberRole ? (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        ROLE_BADGE[entry.memberRole] ??
                          'border-zinc-200 bg-zinc-50 text-zinc-600',
                      )}
                    >
                      {ROLE_LABEL[entry.memberRole]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                {canSeeContact && (
                  <>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                      {entry.email ?? '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                      {entry.phone ?? '—'}
                    </td>
                  </>
                )}
                <td className="px-4 py-3">
                  {entry.memberId ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                      Ocupada
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
                      Libre
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
