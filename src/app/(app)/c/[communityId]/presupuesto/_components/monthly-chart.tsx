'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { MonthRow } from '../page';

const fmt = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1).replace('.0', '')}k€` : `${v}€`;

interface Props {
  data: MonthRow[];
}

export function MonthlyChart({ data }: Props) {
  const hasValues = data.some((d) => d.amount > 0);

  if (!hasValues) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin movimientos registrados en este ejercicio.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="gradEjecutado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.4} />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickFormatter={fmt}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={48}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`${Number(v).toLocaleString('es-ES')} €`, 'Ejecutado']}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#3b82f6"
          fill="url(#gradEjecutado)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
