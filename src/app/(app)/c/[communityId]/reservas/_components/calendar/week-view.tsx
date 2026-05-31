'use client';

import Link from 'next/link';
import { addDays, isToday } from 'date-fns';
import { Plus } from 'lucide-react';

import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';

import { bookingBlockClasses, bookingsOnDay, hourLabel, localDateKey } from '../../_lib/calendar';
import type { BookingView } from '../../_lib/types';

interface Props {
  weekDays: Date[];
  hours: number[];
  bookings: BookingView[];
  communityId: string;
  currentUserId: string;
  closeHour: number;
  outOfService: boolean;
  onSlotClick: (date: string, hour: number) => void;
}

export function WeekView({
  weekDays,
  hours,
  bookings,
  communityId,
  currentUserId,
  outOfService,
  onSlotClick,
}: Props) {
  const openHour = hours[0] ?? 9;
  const now = Date.now();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px]">
        {/* Day headers */}
        <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b">
          <div />
          {weekDays.map((d) => (
            <div
              key={d.toISOString()}
              className={cn('border-l py-2 text-center', isToday(d) && 'bg-dd-terracota/5')}
            >
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {formatDate(d, 'EEE')}
              </p>
              <p
                className={cn(
                  'mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                  isToday(d) && 'bg-dd-terracota text-white',
                )}
              >
                {formatDate(d, 'd')}
              </p>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className="relative grid grid-cols-[56px_repeat(7,minmax(0,1fr))]"
          style={{ gridTemplateRows: `repeat(${hours.length}, 3rem)` }}
        >
          {/* Time gutter */}
          {hours.map((h, i) => (
            <div
              key={`g-${h}`}
              className="-mt-2 pr-2 text-right text-[11px] tabular-nums text-muted-foreground"
              style={{ gridColumn: 1, gridRow: i + 1 }}
            >
              {hourLabel(h)}
            </div>
          ))}

          {/* Background slot cells */}
          {weekDays.map((d, di) =>
            hours.map((h, hi) => {
              const dateKey = localDateKey(d);
              const slotStart = new Date(d);
              slotStart.setHours(h, 0, 0, 0);
              const isPast = slotStart.getTime() < now;
              const disabled = isPast || outOfService;
              return (
                <button
                  key={`${dateKey}-${h}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSlotClick(dateKey, h)}
                  aria-label={`Reservar ${formatDate(d, 'EEE d')} a las ${hourLabel(h)}`}
                  className={cn(
                    'group border-l border-t border-border/60',
                    hi === hours.length - 1 && 'border-b',
                    disabled ? 'cursor-default bg-muted/20' : 'hover:bg-dd-terracota/5',
                  )}
                  style={{ gridColumn: di + 2, gridRow: hi + 1 }}
                >
                  {!disabled && (
                    <Plus className="mx-auto h-3.5 w-3.5 text-dd-terracota opacity-0 transition-opacity group-hover:opacity-70" />
                  )}
                </button>
              );
            }),
          )}

          {/* Booking blocks */}
          {weekDays.map((d, di) => {
            const dayBookings = bookingsOnDay(bookings, localDateKey(d));
            return dayBookings.map((b) => {
              const s = new Date(b.startsAt);
              const e = new Date(b.endsAt);
              const sFrac = s.getHours() + s.getMinutes() / 60;
              const eFrac = e.getHours() + e.getMinutes() / 60;
              const startRow = Math.max(1, Math.floor(sFrac) - openHour + 1);
              const endRow = Math.min(hours.length + 1, Math.ceil(eFrac) - openHour + 1);
              const span = Math.max(1, endRow - startRow);
              const isOwn = b.createdBy === currentUserId;
              return (
                <Link
                  key={b.id}
                  href={`/c/${communityId}/reservas/${b.id}`}
                  className={cn(
                    'z-10 m-px flex flex-col gap-0.5 overflow-hidden rounded-md px-1.5 py-1 text-[11px] leading-tight transition-shadow hover:shadow-md',
                    bookingBlockClasses(b, isOwn),
                  )}
                  style={{ gridColumn: di + 2, gridRow: `${startRow} / span ${span}` }}
                >
                  <span className="font-semibold">
                    {formatDate(s, 'HH:mm')}–{formatDate(e, 'HH:mm')}
                  </span>
                  <span className="truncate">{b.purpose}</span>
                </Link>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
