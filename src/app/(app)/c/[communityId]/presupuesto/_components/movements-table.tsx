import { FileSpreadsheet, Receipt } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import type { MovementRow } from '../page';

interface Props {
  movements: MovementRow[];
  canImport: boolean;
  communityId: string;
  year: number;
}

const DATE_FMT = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatDate(dateStr: string) {
  try {
    return DATE_FMT.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function MovementsTable({ movements, canImport, communityId, year }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Últimos movimientos</h2>
          <p className="text-xs text-muted-foreground">{movements.length} registros · ejercicio {year}</p>
        </div>
        {canImport && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/c/${communityId}/presupuesto/importar`}>
              <FileSpreadsheet className="h-4 w-4" />
              Importar gastos
            </Link>
          </Button>
        )}
      </div>

      {movements.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Receipt}
            title="Sin movimientos"
            description="No hay gastos registrados para este ejercicio. Importa un archivo CSV o añade movimientos manualmente."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Concepto
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">
                  Categoría
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Importe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movements.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(m.date)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {m.description ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {m.categoryName ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        style={
                          m.categoryColor
                            ? {
                                borderColor: `${m.categoryColor}40`,
                                backgroundColor: `${m.categoryColor}15`,
                                color: m.categoryColor,
                              }
                            : undefined
                        }
                      >
                        {m.categoryName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-red-600 dark:text-red-400">
                    −{m.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
