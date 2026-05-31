'use client';

import { useRouter } from 'next/navigation';

interface Props {
  current: number;
  communityId: string;
}

export function YearSelector({ current, communityId }: Props) {
  const router = useRouter();
  const years = Array.from({ length: 5 }, (_, i) => current - 2 + i);

  return (
    <select
      value={current}
      onChange={(e) =>
        router.push(`/c/${communityId}/presupuesto?year=${e.target.value}`)
      }
      className="h-9 rounded-md border bg-background px-3 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}
