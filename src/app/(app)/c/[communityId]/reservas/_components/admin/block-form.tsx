'use client';

import { useState } from 'react';
import { Ban, Loader2 } from 'lucide-react';

import { blockSlot } from '@/actions/bookings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormTransition } from '@/hooks/use-form-transition';

import { localDateKey } from '../../_lib/calendar';
import { HourSelect } from './hour-select';

interface Props {
  communityId: string;
  openHour: number;
  closeHour: number;
}

export function BlockForm({ communityId, openHour, closeHour }: Props) {
  const today = localDateKey(new Date());
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState(openHour);
  const [endHour, setEndHour] = useState(openHour + 1);
  const [reason, setReason] = useState('');

  const { submit, error, pending } = useFormTransition(
    (data: Parameters<typeof blockSlot>[1]) => blockSlot(communityId, data),
    {
      successMessage: 'Franja bloqueada',
      onSuccess: () => {
        setDate('');
        setReason('');
      },
    },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit({ date, startHour, endHour, reason });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="bl-date">Fecha</Label>
        <Input
          id="bl-date"
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
          <Label htmlFor="bl-start">Desde</Label>
          <HourSelect
            id="bl-start"
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
          <Label htmlFor="bl-end">Hasta</Label>
          <HourSelect
            id="bl-end"
            value={endHour}
            onChange={setEndHour}
            from={startHour + 1}
            to={closeHour}
            disabled={pending}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bl-reason">Motivo del bloqueo</Label>
        <Input
          id="bl-reason"
          required
          maxLength={160}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: Mantenimiento del suelo técnico"
          disabled={pending}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" variant="secondary" disabled={pending} className="w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
        Bloquear franja
      </Button>
    </form>
  );
}
