import { Banknote, Percent, TrendingDown, TrendingUp } from 'lucide-react';

import { KpiCard } from '@/components/shared/kpi-card';
import { requireMember } from '@/lib/auth/require-user';
import { isAtLeast } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';

import { CategoryChart } from './_components/category-chart';
import { MonthlyChart } from './_components/monthly-chart';
import { MovementsTable } from './_components/movements-table';
import { YearSelector } from './_components/year-selector';

type Params = Promise<{ communityId: string }>;
type Search = Promise<{ year?: string }>;

export type CategoryRow = {
  name: string;
  color: string | null;
  presupuestado: number;
  ejecutado: number;
};

export type MonthRow = {
  mes: string;
  amount: number;
};

export type MovementRow = {
  id: string;
  date: string;
  description: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  amount: number;
};

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export default async function PresupuestoPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { communityId } = await params;
  const { year: yearParam } = await searchParams;
  const { role } = await requireMember(communityId);

  const currentYear = new Date().getFullYear();
  const year = yearParam ? parseInt(yearParam, 10) : currentYear;

  const supabase = await createServerClient();

  const [{ data: entries }, { data: categories }] = await Promise.all([
    supabase
      .from('budget_entries')
      .select('id, amount_eur, kind, month, entry_date, description, category_id')
      .eq('community_id', communityId)
      .eq('year', year)
      .order('entry_date', { ascending: false }),
    supabase
      .from('budget_categories')
      .select('id, name, color')
      .eq('community_id', communityId),
  ]);

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]));
  const allEntries = entries ?? [];

  const presupuestado = allEntries
    .filter((e) => e.kind === 'presupuestado')
    .reduce((s, e) => s + e.amount_eur, 0);
  const ejecutado = allEntries
    .filter((e) => e.kind === 'ejecutado')
    .reduce((s, e) => s + e.amount_eur, 0);
  const pendiente = Math.max(0, presupuestado - ejecutado);
  const pct = presupuestado > 0 ? Math.round((ejecutado / presupuestado) * 100) : 0;

  // By category
  const catAgg = new Map<
    string,
    { name: string; color: string | null; presupuestado: number; ejecutado: number }
  >();
  for (const e of allEntries) {
    const key = e.category_id ?? '__none__';
    const cat = e.category_id ? categoryMap.get(e.category_id) : null;
    if (!catAgg.has(key)) {
      catAgg.set(key, {
        name: cat?.name ?? 'Sin categoría',
        color: cat?.color ?? null,
        presupuestado: 0,
        ejecutado: 0,
      });
    }
    const row = catAgg.get(key)!;
    if (e.kind === 'presupuestado') row.presupuestado += e.amount_eur;
    if (e.kind === 'ejecutado') row.ejecutado += e.amount_eur;
  }
  const byCategory: CategoryRow[] = [...catAgg.values()]
    .filter((r) => r.presupuestado > 0 || r.ejecutado > 0)
    .sort((a, b) => b.ejecutado - a.ejecutado);

  // By month
  const monthAgg = new Map<number, number>();
  for (let m = 1; m <= 12; m++) monthAgg.set(m, 0);
  for (const e of allEntries) {
    if (e.kind === 'ejecutado' && e.month) {
      monthAgg.set(e.month, (monthAgg.get(e.month) ?? 0) + e.amount_eur);
    }
  }
  const byMonth: MonthRow[] = Array.from(monthAgg.entries()).map(([m, amount]) => ({
    mes: MONTH_LABELS[m - 1] ?? `M${m}`,
    amount,
  }));

  // Latest movements
  const movements: MovementRow[] = allEntries
    .filter((e) => e.kind === 'ejecutado')
    .slice(0, 25)
    .map((e) => ({
      id: e.id,
      date: e.entry_date,
      description: e.description,
      categoryName: e.category_id ? (categoryMap.get(e.category_id)?.name ?? null) : null,
      categoryColor: e.category_id ? (categoryMap.get(e.category_id)?.color ?? null) : null,
      amount: e.amount_eur,
    }));

  const canImport = isAtLeast(role, 'junta');
  const hasData = allEntries.length > 0;

  const fmt = (n: number) =>
    n.toLocaleString('es-ES', { maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="container space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Presupuesto</h1>
          <p className="text-sm text-muted-foreground">
            Ejercicio {year} · seguimiento de ingresos y gastos
          </p>
        </div>
        <YearSelector current={year} communityId={communityId} />
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Presupuesto anual" value={fmt(presupuestado)} icon={Banknote} tone="blue" />
        <KpiCard
          label="Ejecutado"
          value={fmt(ejecutado)}
          icon={TrendingDown}
          tone="amber"
          trend={hasData ? { value: `${pct}% del presupuesto` } : undefined}
        />
        <KpiCard label="Pendiente" value={fmt(pendiente)} icon={TrendingUp} tone="green" />
        <KpiCard label="% ejecutado" value={`${pct}%`} icon={Percent} />
      </div>

      {hasData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Gasto por categoría</h2>
            <CategoryChart data={byCategory} />
          </div>
          <div className="overflow-hidden rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Ejecución mensual — {year}</h2>
            <MonthlyChart data={byMonth} />
          </div>
        </div>
      )}

      <MovementsTable
        movements={movements}
        canImport={canImport}
        communityId={communityId}
        year={year}
      />
    </div>
  );
}
