import { cn } from '@/lib/utils';

import type { BookingView } from './types';

export const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** yyyy-MM-dd en hora local (sin desfases UTC). */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Reservas que ocupan la sala (no canceladas) — las que pintan el calendario. */
export function activeBookings(bookings: BookingView[]): BookingView[] {
  return bookings.filter((b) => b.status !== 'cancelada');
}

/** ¿La franja [hour, hour+1) de `dateKey` está ocupada por alguna reserva activa? */
export function isHourBusy(
  bookings: BookingView[],
  dateKey: string,
  hour: number,
): boolean {
  return activeBookings(bookings).some((b) => {
    const s = new Date(b.startsAt);
    const e = new Date(b.endsAt);
    if (localDateKey(s) !== dateKey) return false;
    const hs = s.getHours() + s.getMinutes() / 60;
    const he = e.getHours() + e.getMinutes() / 60;
    return hs < hour + 1 && he > hour;
  });
}

/** Reservas activas de un día concreto, ordenadas por hora de inicio. */
export function bookingsOnDay(bookings: BookingView[], dateKey: string): BookingView[] {
  return activeBookings(bookings)
    .filter((b) => localDateKey(new Date(b.startsAt)) === dateKey)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

/** Clases del bloque de reserva según tipo/estado. */
export function bookingBlockClasses(b: BookingView, isOwn: boolean): string {
  const base = 'border';
  let tone: string;
  if (b.kind === 'bloqueo') {
    tone = 'border-dd-taupe/40 bg-dd-taupe/15 text-dd-taupe dark:text-dd-beige/70';
  } else if (b.kind === 'comunidad') {
    tone =
      'border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200';
  } else if (b.status === 'pendiente') {
    tone =
      'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200';
  } else {
    tone =
      'border-dd-terracota/40 bg-dd-terracota/10 text-dd-terracota dark:border-dd-terracota/50';
  }
  return cn(base, tone, isOwn && 'ring-2 ring-dd-terracota/50 ring-offset-1 ring-offset-background');
}

/** Dot color para listas/agenda. */
export function bookingDotClass(b: BookingView): string {
  if (b.kind === 'bloqueo') return 'bg-dd-taupe';
  if (b.kind === 'comunidad') return 'bg-blue-500';
  if (b.status === 'pendiente') return 'bg-amber-500';
  return 'bg-dd-terracota';
}
