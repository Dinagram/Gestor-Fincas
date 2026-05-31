'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { hourLabel } from '../../_lib/calendar';

interface HourSelectProps {
  id: string;
  value: number;
  onChange: (n: number) => void;
  from: number;
  to: number;
  disabled?: boolean;
}

export function HourSelect({ id, value, onChange, from, to, disabled }: HourSelectProps) {
  const opts: number[] = [];
  for (let h = from; h <= to; h++) opts.push(h);
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))} disabled={disabled}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opts.map((h) => (
          <SelectItem key={h} value={String(h)}>
            {hourLabel(h)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
