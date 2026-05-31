'use client';

import Link from 'next/link';
import { CalendarRange, Users } from 'lucide-react';

import { BOOKING_KIND_LABEL } from '@/lib/constants';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';

import { BookingStatusPill } from '../booking-status-pill';
import { bookingDotClass, localDateKey } from '../../_lib/calendar';
import type { BookingView } from '../../_lib/types';

interface Props {
  bookings: BookingView[];
  communityId: string;
  currentUserId: string;
}

export function AgendaView({ bookings, communityId, currentUserId }: Props) {
  const now = Date.now();
  const upcoming = bookings
    .filter((b) => b.status !== 'cancelada' && new Date(b.endsAt).getTime() > now)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .slice(0, 40);

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
        <CalendarRange className="h-6 w-6" />
        No hay reservas próximas. ¡La sala está libre!
      </div>
    );
  }

  const groups = new Map<string, BookingView[]>();
  for (const b of upcoming) {
    const key = localDateKey(new Date(b.startsAt));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(b);
  }

  return (
    <div className="divide-y">
      {[...groups.entries()].map(([key, items]) => {
        const day = new Date(`${key}T00:00:00`);
        return (
          <div key={key} className="flex gap-4 p-4">
            <div className="w-14 shrink-0 text-center">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {formatDate(day, 'EEE')}
              </p>
              <p className="font-display text-2xl font-semibold text-dd-terracota">
                {formatDate(day, 'd')}
              </p>
              <p className="text-[11px] text-muted-foreground">{formatDate(day, 'MMM')}</p>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              {items.map((b) => (
                <Link
                  key={b.id}
                  href={`/c/${communityId}/reservas/${b.id}`}
                  className="flex items-center gap-3 rounded-lg border bg-card p-2.5 transition-colors hover:border-primary/40"
                >
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', bookingDotClass(b))} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-sm font-medium">{b.purpose}</span>
                      {b.kind !== 'vecino' && (
                        <span className="text-[11px] text-muted-foreground">
                          {BOOKING_KIND_LABEL[b.kind]}
                        </span>
                      )}
                      {b.createdBy === currentUserId && (
                        <span className="text-[11px] font-medium text-dd-terracota">Tú</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(b.startsAt), 'HH:mm')}–
                      {formatDate(new Date(b.endsAt), 'HH:mm')}
                      {b.attendees != null && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {b.attendees}
                        </span>
                      )}
                    </p>
                  </div>
                  <BookingStatusPill status={b.status} />
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
