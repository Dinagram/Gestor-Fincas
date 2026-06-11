'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ROLE_LABEL } from '@/lib/constants';
import { formatDate } from '@/lib/date';
import type { Role } from '@/lib/permissions';
import type { DirectoryEntry, UnitOption } from '../page';
import { EditMemberDialog } from './edit-member-dialog';

// Tipo de residencia (relación con la vivienda)
const TIPO_LABEL: Record<string, string> = {
  propietario: 'Propietario',
  junta: 'Propietario',
  admin_finca: 'Propietario',
  inquilino: 'Inquilino',
};

const TIPO_BADGE: Record<string, string> = {
  propietario: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300',
  junta:       'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300',
  admin_finca: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300',
  inquilino:   'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400',
};

// Cargo en la comunidad (solo junta y admin tienen tag)
const TAG_BADGE: Record<string, string> = {
  junta:       'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300',
  admin_finca: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/60 dark:text-orange-300',
};

const TAG_LABEL: Record<string, string> = {
  junta:       'Junta',
  admin_finca: 'Administrador',
};

const PAYMENT_BADGE: Record<DirectoryEntry['paymentStatus'], string> = {
  al_dia:   'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
  moroso:   'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300',
  pendiente:'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
};

const PAYMENT_LABEL: Record<DirectoryEntry['paymentStatus'], string> = {
  al_dia:   'Al día',
  moroso:   'Moroso',
  pendiente:'Pendiente',
};

interface Props {
  entries: DirectoryEntry[];
  units: UnitOption[];
  canSeeContact: boolean;
  canEditMembers: boolean;
  communityId: string;
  viewerRole: Role;
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function formatUnit(floor: string, door: string): string {
  return `${floor}º${door}`;
}

export function MembersTable({ entries, units, canSeeContact, canEditMembers, communityId, viewerRole }: Props) {
  const [editingEntry, setEditingEntry] = useState<DirectoryEntry | null>(null);

  return (
    <>
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
                {canSeeContact && (
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
                    Contacto
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tipo
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
                  Tags
                </th>
                {canSeeContact && (
                  <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
                    Cuota
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Estado
                </th>
                {canEditMembers && (
                  <th className="w-12 px-4 py-3" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((entry) => (
                <tr key={entry.unitId} className="transition-colors hover:bg-muted/30">
                  {/* Unidad */}
                  <td className="px-4 py-3 font-mono text-sm font-semibold tabular-nums">
                    {entry.memberId
                      ? formatUnit(entry.floor, entry.door)
                      : <span className="text-muted-foreground">{formatUnit(entry.floor, entry.door)}</span>
                    }
                  </td>

                  {/* Vecino */}
                  <td className="px-4 py-3">
                    {entry.fullName ? (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground">
                          {initials(entry.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{entry.fullName}</p>
                          {entry.joinedAt && (
                            <p className="text-xs text-muted-foreground">
                              Desde {formatDate(entry.joinedAt, 'MMM yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Vacía</span>
                    )}
                  </td>

                  {/* Contacto */}
                  {canSeeContact && (
                    <td className="hidden px-4 py-3 md:table-cell">
                      {entry.email || entry.phone ? (
                        <div className="space-y-0.5">
                          {entry.email && (
                            <p className="truncate text-sm text-muted-foreground">{entry.email}</p>
                          )}
                          {entry.phone && (
                            <p className="text-xs text-muted-foreground">{entry.phone}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )}

                  {/* Tipo */}
                  <td className="px-4 py-3">
                    {entry.memberRole ? (
                      <span className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        TIPO_BADGE[entry.memberRole] ?? 'border-zinc-200 bg-zinc-50 text-zinc-600',
                      )}>
                        {TIPO_LABEL[entry.memberRole] ?? ROLE_LABEL[entry.memberRole]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Tags */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {entry.memberRole && TAG_BADGE[entry.memberRole] ? (
                      <span className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        TAG_BADGE[entry.memberRole],
                      )}>
                        {TAG_LABEL[entry.memberRole]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Cuota */}
                  {canSeeContact && (
                    <td className="hidden px-4 py-3 text-right lg:table-cell">
                      {entry.memberId ? (
                        <span className="tabular-nums text-sm font-medium">
                          {entry.monthlyFee > 0
                            ? `${entry.monthlyFee.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €/mes`
                            : '—'
                          }
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )}

                  {/* Estado */}
                  <td className="px-4 py-3">
                    {entry.memberId ? (
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        PAYMENT_BADGE[entry.paymentStatus],
                      )}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                        {PAYMENT_LABEL[entry.paymentStatus]}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400">
                        Libre
                      </span>
                    )}
                  </td>

                  {/* Editar */}
                  {canEditMembers && (
                    <td className="px-4 py-3">
                      {entry.memberId && (
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Editar vecino"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingEntry && (
        <EditMemberDialog
          communityId={communityId}
          entry={editingEntry}
          units={units}
          viewerRole={viewerRole}
          open={!!editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  );
}
