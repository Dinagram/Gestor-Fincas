'use client';

import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';

import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';

import { bookingBlockClasses, bookingsOnDay, localDateKey } from '../../_lib/calendar';
import type { BookingView } from '../../_lib/types';

interface Props {
  cursor: Date;
  bookings: BookingView[];
  communityId: string;
  currentUserId: string;
  onPickDay: (d: Date) => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function MonthView({ cursor, bookings, currentUserId, onPickDay }: Props) {
  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    capitalize(formatDate(addDays(gridStart, i), 'EEEEEE')),
  );

  return (
    <div className="p-3">
      <div className="grid grid-cols-7">
        {weekdayNames.map((n, i) => (
          <div
            key={i}
            className="pb-1 text-center text-[11px] uppercase tracking-wide text-muted-foreground"
          >
            {n}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
        {days.map((d) => {
          const dayBookings = bookingsOnDay(bookings, localDateKey(d));
          const inMonth = isSameMonth(d, cursor);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onPickDay(d)}
              className={cn(
                'flex min-h-[88px] flex-col gap-1 bg-card p-1.5 text-left transition-colors hover:bg-dd-terracota/5',
                !inMonth && 'bg-muted/40 text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                  isToday(d) && 'bg-dd-terracota text-white',
                )}
              >
                {formatDate(d, 'd')}
              </span>
              <div className="space-y-0.5">
                {dayBookings.slice(0, 2).map((b) => (
                  <span
                    key={b.id}
                    className={cn(
                      'flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] font-medium',
                      bookingBlockClasses(b, b.createdBy === currentUserId),
                    )}
                  >
                    <span className="tabular-nums">
                      {formatDate(new Date(b.startsAt), 'HH:mm')}
                    </span>
                    <span className="truncate">{b.purpose}</span>
                  </span>
                ))}
                {dayBookings.length > 2 && (
                  <span className="block px-1 text-[10px] text-muted-foreground">
                    +{dayBookings.length - 2} más
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Toca un día para ver la semana y reservar una franja.
      </p>
    </div>
  );
}
