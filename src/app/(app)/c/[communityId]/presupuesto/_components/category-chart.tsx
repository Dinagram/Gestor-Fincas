'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { CategoryRow } from '../page';

const DEFAULT_COLORS = [
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
];

const fmt = (v: number) =>
  v >= 1000
    ? `${(v / 1000).toFixed(1).replace('.0', '')}k€`
    : `${v}€`;

interface Props {
  data: CategoryRow[];
}

export function CategoryChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin datos de categorías para este ejercicio.
      </div>
    );
  }

  const chartData = data.map((row, i) => ({
    name: row.name,
    presupuestado: Math.round(row.presupuestado),
    ejecutado: Math.round(row.ejecutado),
    color: row.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  const maxNameLen = Math.max(...chartData.map((d) => d.name.length));
  const leftMargin = Math.min(Math.max(maxNameLen * 6, 60), 120);

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36 + 16)}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ left: leftMargin, right: 24, top: 4, bottom: 4 }}
        barSize={10}
        barGap={4}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" strokeOpacity={0.4} />
        <XAxis
          type="number"
          tickFormatter={fmt}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={leftMargin}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [
            `${Number(v).toLocaleString('es-ES')} €`,
            name === 'presupuestado' ? 'Presupuestado' : 'Ejecutado',
          ]}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="presupuestado" fill="#e2e8f0" radius={[0, 4, 4, 0]} name="presupuestado" />
        <Bar dataKey="ejecutado" fill="#f59e0b" radius={[0, 4, 4, 0]} name="ejecutado" />
      </BarChart>
    </ResponsiveContainer>
  );
}
