'use client';

import { useRef, useState } from 'react';
import { Grid3X3, LayoutList, Search, Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { importMembers, type ImportRow } from '@/actions/directory';
import type { Role } from '@/lib/permissions';
import type { DirectoryEntry } from '../page';

import { FloorPlan } from './floor-plan';
import { MembersTable } from './members-table';
import type { UnitOption } from '../page';

type ViewMode = 'tabla' | 'plano';
type FilterKey = 'todos' | 'propietarios' | 'inquilinos' | 'vacías' | 'morosos';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos',        label: 'Todos' },
  { key: 'propietarios', label: 'Propietarios' },
  { key: 'inquilinos',   label: 'Inquilinos' },
  { key: 'vacías',       label: 'Vacías' },
  { key: 'morosos',      label: 'Morosos' },
];

interface Props {
  entries: DirectoryEntry[];
  units: UnitOption[];
  canSeeContact: boolean;
  canEditMembers: boolean;
  communityId: string;
  viewerRole: Role;
}

// ── Exportar a XLS ──────────────────────────────────────────────────────────
function exportToXls(entries: DirectoryEntry[]) {
  const rows = entries.map((e) => ({
    'Unidad':      `${e.floor}º${e.door}`,
    'Nombre':      e.fullName ?? '',
    'Email':       e.email ?? '',
    'Teléfono':    e.phone ?? '',
    'Vecino desde': e.joinedAt ? new Date(e.joinedAt).toLocaleDateString('es-ES') : '',
    'Tipo':        e.memberRole === 'inquilino' ? 'Inquilino' : e.memberRole ? 'Propietario' : '',
    'Tags':        e.memberRole === 'junta' ? 'Junta' : e.memberRole === 'admin_finca' ? 'Administrador' : '',
    'Cuota (€/mes)': e.memberId ? e.monthlyFee : '',
    'Estado pago': e.memberId
      ? { al_dia: 'Al día', moroso: 'Moroso', pendiente: 'Pendiente' }[e.paymentStatus]
      : 'Vacía',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 8 }, { wch: 24 }, { wch: 28 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Directorio');
  XLSX.writeFile(wb, 'directorio-vecinos.xlsx');
}

// ── Plantilla de importación ────────────────────────────────────────────────
function downloadTemplate() {
  const rows = [
    { 'Planta': '1', 'Puerta': 'A', 'Nombre': 'Ana García López', 'Email': 'ana.garcia@example.com', 'Teléfono': '+34 600 000 001', 'Tipo': 'propietario', 'Cuota': 120 },
    { 'Planta': '2', 'Puerta': 'B', 'Nombre': 'Luis Martín Soto', 'Email': 'luis.martin@example.com', 'Teléfono': '+34 600 000 002', 'Tipo': 'inquilino',   'Cuota': 0 },
  ];
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 8 }, { wch: 8 }, { wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 8 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vecinos');
  XLSX.writeFile(wb, 'plantilla-importar-vecinos.xlsx');
}

// ── Parsear XLS subido ───────────────────────────────────────────────────────
function parseImportFile(file: File): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]!]!;
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const parsed: ImportRow[] = rows.map((r) => ({
          floor:       String(r['Planta'] ?? '').trim(),
          door:        String(r['Puerta'] ?? '').trim().toUpperCase(),
          fullName:    String(r['Nombre'] ?? '').trim(),
          email:       String(r['Email'] ?? '').trim().toLowerCase(),
          phone:       r['Teléfono'] ? String(r['Teléfono']).trim() : undefined,
          role:        (String(r['Tipo'] ?? 'propietario').trim().toLowerCase() === 'inquilino' ? 'inquilino' : 'propietario') as 'propietario' | 'inquilino',
          monthlyFee:  r['Cuota'] != null ? Number(r['Cuota']) : undefined,
        })).filter((r) => r.floor && r.door && r.email);
        resolve(parsed);
      } catch {
        reject(new Error('No se pudo leer el fichero. Asegúrate de que es un Excel válido.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el fichero.'));
    reader.readAsArrayBuffer(file);
  });
}

// ── Componente principal ─────────────────────────────────────────────────────
export function DirectoryView({ entries, units, canSeeContact, canEditMembers, communityId, viewerRole }: Props) {
  const [view, setView] = useState<ViewMode>('tabla');
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [search, setSearch] = useState('');

  // Import dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = entries
    .filter((e) => {
      if (filter === 'propietarios') return ['propietario', 'junta', 'admin_finca'].includes(e.memberRole ?? '');
      if (filter === 'inquilinos')   return e.memberRole === 'inquilino';
      if (filter === 'vacías')       return e.memberId === null;
      if (filter === 'morosos')      return e.paymentStatus === 'moroso';
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

  async function handleFileChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const file = evt.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportResult(null);
    try {
      const rows = await parseImportFile(file);
      if (rows.length === 0) {
        setImportError('El fichero no contiene filas válidas. Descarga la plantilla para ver el formato esperado.');
      } else {
        setImportRows(rows);
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Error al leer el fichero.');
    }
    evt.target.value = '';
  }

  async function handleConfirmImport() {
    setImporting(true);
    const result = await importMembers(communityId, importRows);
    setImportResult({ imported: result.imported, errors: result.errors });
    setImportRows([]);
    setImporting(false);
  }

  function handleImportClose() {
    setImportOpen(false);
    setImportRows([]);
    setImportError(null);
    setImportResult(null);
  }

  return (
    <div className="space-y-4">
      {/* Filtros + controles */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === f.key
                  ? f.key === 'morosos'
                    ? 'bg-red-600 text-white'
                    : 'bg-foreground text-background'
                  : f.key === 'morosos'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar vecino…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 pl-8 text-sm"
            />
          </div>

          {/* Exportar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToXls(filtered)}
            className="h-8 gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>

          {/* Importar (solo junta+) */}
          {canSeeContact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              Importar
            </Button>
          )}

          {/* Toggle vista */}
          <div className="flex rounded-lg border bg-muted/50 p-0.5">
            <button
              onClick={() => setView('tabla')}
              aria-label="Vista tabla"
              className={cn(
                'rounded-md p-1.5 transition-colors',
                view === 'tabla' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('plano')}
              aria-label="Vista plano"
              className={cn(
                'rounded-md p-1.5 transition-colors',
                view === 'plano' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla / Plano */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron vecinos con ese filtro.
          </p>
        </div>
      ) : view === 'tabla' ? (
        <MembersTable entries={filtered} units={units} canSeeContact={canSeeContact} canEditMembers={canEditMembers} communityId={communityId} viewerRole={viewerRole} />
      ) : (
        <FloorPlan entries={filtered} />
      )}

      {/* Dialog de importación */}
      <Dialog open={importOpen} onOpenChange={(o) => { if (!o) handleImportClose(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar vecinos desde Excel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Plantilla */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2.5 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span>¿Primera vez? Descarga la plantilla con el formato esperado.</span>
              </div>
              <Button variant="ghost" size="sm" onClick={downloadTemplate} className="h-7 text-xs gap-1">
                <Download className="h-3 w-3" />
                Plantilla
              </Button>
            </div>

            {/* Upload */}
            {!importResult && (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Seleccionar fichero Excel (.xlsx)
                </Button>
              </div>
            )}

            {/* Error de parseo */}
            {importError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {importError}
              </div>
            )}

            {/* Previsualización */}
            {importRows.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{importRows.length} filas detectadas — previsualización:</p>
                <div className="max-h-48 overflow-y-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        {['Unidad', 'Nombre', 'Email', 'Tipo', 'Cuota'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {importRows.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 font-mono">{r.floor}º{r.door}</td>
                          <td className="px-3 py-1.5">{r.fullName}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{r.email}</td>
                          <td className="px-3 py-1.5 capitalize">{r.role}</td>
                          <td className="px-3 py-1.5 tabular-nums">{r.monthlyFee != null ? `${r.monthlyFee} €` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Resultado */}
            {importResult && (
              <div className={cn(
                'rounded-lg border p-3 text-sm',
                importResult.errors.length === 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
              )}>
                <p className="font-medium">
                  {importResult.imported} {importResult.imported === 1 ? 'vecino importado' : 'vecinos importados'} correctamente.
                </p>
                {importResult.errors.length > 0 && (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                    {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleImportClose}>
              {importResult ? 'Cerrar' : 'Cancelar'}
            </Button>
            {importRows.length > 0 && !importResult && (
              <Button onClick={handleConfirmImport} disabled={importing}>
                {importing ? 'Importando…' : `Confirmar ${importRows.length} vecinos`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
