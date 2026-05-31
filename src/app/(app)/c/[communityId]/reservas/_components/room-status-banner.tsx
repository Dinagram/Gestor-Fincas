'use client';

import { CalendarPlus, DoorOpen, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BOOKING_KIND_LABEL } from '@/lib/constants';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';

import type { BookingView, RoomView } from '../_lib/types';

interface Props {
  room: RoomView;
  currentBooking: BookingView | null;
  onReserve: () => void;
}

export function RoomStatusBanner({ room, currentBooking, onReserve }: Props) {
  const outOfService = room.status === 'fuera_servicio';
  const reservedNow = !outOfService && currentBooking != null;
  const available = !outOfService && !reservedNow;

  const tone = outOfService
    ? 'border-dd-taupe/30 bg-dd-taupe/10'
    : reservedNow
      ? 'border-blue-300/50 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30'
      : 'border-emerald-300/50 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20';

  const dotColor = outOfService
    ? 'bg-dd-taupe'
    : reservedNow
      ? 'bg-blue-500'
      : 'bg-emerald-500';

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between',
        tone,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/70">
          {outOfService ? (
            <Wrench className="h-4 w-4 text-dd-taupe" />
          ) : (
            <DoorOpen className={cn('h-4 w-4', reservedNow ? 'text-blue-600' : 'text-emerald-600')} />
          )}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('status-dot', dotColor)} aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estado actual
            </p>
          </div>
          {outOfService && (
            <>
              <p className="mt-0.5 font-display text-xl font-semibold">Fuera de servicio</p>
              <p className="text-sm text-muted-foreground">
                {room.outOfServiceReason ?? 'La sala no admite reservas temporalmente.'}
              </p>
            </>
          )}
          {reservedNow && currentBooking && (
            <>
              <p className="mt-0.5 font-display text-xl font-semibold">
                Reservada para {currentBooking.purpose.toLowerCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentBooking.kind !== 'vecino' && `${BOOKING_KIND_LABEL[currentBooking.kind]} · `}
                En uso hasta las {formatDate(new Date(currentBooking.endsAt), 'HH:mm')}
              </p>
            </>
          )}
          {available && (
            <>
              <p className="mt-0.5 font-display text-xl font-semibold">Disponible para reservas</p>
              <p className="text-sm text-muted-foreground">
                {room.name} · aforo {room.capacity} · horario{' '}
                {String(room.openHour).padStart(2, '0')}:00–
                {String(room.closeHour).padStart(2, '0')}:00
              </p>
            </>
          )}
        </div>
      </div>

      <Button size="lg" onClick={onReserve} disabled={outOfService} className="shrink-0">
        <CalendarPlus className="h-4 w-4" />
        Reservar la sala
      </Button>
    </div>
  );
}
