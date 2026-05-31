'use client';

import { useState } from 'react';
import { CalendarPlus, Loader2 } from 'lucide-react';

import { createCommunityEvent } from '@/actions/bookings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BOOKING_CATEGORIES, BOOKING_CATEGORY_LABEL } from '@/lib/constants';
import { useFormTransition } from '@/hooks/use-form-transition';

import { localDateKey } from '../../_lib/calendar';
import { HourSelect } from './hour-select';

interface Props {
  communityId: string;
  openHour: number;
  closeHour: number;
}

export function EventForm({ communityId, openHour, closeHour }: Props) {
  const today = localDateKey(new Date());
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState(openHour);
  const [endHour, setEndHour] = useState(openHour + 1);
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState<string>('reunion');

  const { submit, error, pending } = useFormTransition(
    (data: Parameters<typeof createCommunityEvent>[1]) =>
      createCommunityEvent(communityId, data),
    {
      successMessage: 'Evento comunitario creado',
      onSuccess: () => {
        setDate('');
        setPurpose('');
      },
    },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit({ date, startHour, endHour, purpose, category });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="ev-date">Fecha</Label>
        <Input
          id="ev-date"
          type="date"
          required
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={pending}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ev-start">Desde</Label>
          <HourSelect
            id="ev-start"
            value={startHour}
            onChange={(h) => {
              setStartHour(h);
              if (endHour <= h) setEndHour(h + 1);
            }}
            from={openHour}
            to={closeHour - 1}
            disabled={pending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-end">Hasta</Label>
          <HourSelect
            id="ev-end"
            value={endHour}
            onChange={setEndHour}
            from={startHour + 1}
            to={closeHour}
            disabled={pending}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ev-purpose">Motivo</Label>
        <Input
          id="ev-purpose"
          required
          maxLength={160}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Ej: Asamblea ordinaria de vecinos"
          disabled={pending}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ev-cat">Tipo</Label>
        <Select value={category} onValueChange={setCategory} disabled={pending}>
          <SelectTrigger id="ev-cat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOOKING_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {BOOKING_CATEGORY_LABEL[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
        Crear evento
      </Button>
    </form>
  );
}
