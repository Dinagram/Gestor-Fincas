'use client';

import { useMemo, useState } from 'react';
import { addDays, addMonths, addWeeks, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';

import { AgendaView } from './calendar/agenda-view';
import { MonthView } from './calendar/month-view';
import { WeekView } from './calendar/week-view';
import type { BookingView, RoomView } from '../_lib/types';

type View = 'mes' | 'semana' | 'agenda';

interface Props {
  communityId: string;
  room: RoomView;
  bookings: BookingView[];
  currentUserId: string;
  onSlotClick: (date: string, hour: number) => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function BookingCalendar({
  communityId,
  room,
  bookings,
  currentUserId,
  onSlotClick,
}: Props) {
  const [view, setView] = useState<View>('semana');
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const outOfService = room.status === 'fuera_servicio';
  const hours = useMemo(() => {
    const out: number[] = [];
    for (let h = room.openHour; h < room.closeHour; h++) out.push(h);
    return out;
  }, [room.openHour, room.closeHour]);

  const weekStart = startOfWeek(cursor, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function move(dir: -1 | 1) {
    if (view === 'mes') setCursor((c) => addMonths(c, dir));
    else setCursor((c) => addWeeks(c, dir));
  }

  function goToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCursor(d);
  }

  const label =
    view === 'mes'
      ? capitalize(formatDate(cursor, 'LLLL yyyy'))
      : view === 'semana'
        ? `${formatDate(weekStart, 'd MMM')} – ${formatDate(addDays(weekStart, 6), 'd MMM')}`
        : 'Próximas reservas';

  return (
    <div className="rounded-xl border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
        <div className="flex items-center gap-1">
          {view !== 'agenda' && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => move(-1)}
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => move(1)}
                aria-label="Siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8" onClick={goToday}>
                Hoy
              </Button>
            </>
          )}
          <span className="ml-1 text-sm font-semibold capitalize">{label}</span>
        </div>

        <div className="inline-flex items-center rounded-lg bg-muted p-0.5">
          {(['mes', 'semana', 'agenda'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors',
                view === v
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'semana' && (
        <WeekView
          weekDays={weekDays}
          hours={hours}
          bookings={bookings}
          communityId={communityId}
          currentUserId={currentUserId}
          closeHour={room.closeHour}
          outOfService={outOfService}
          onSlotClick={onSlotClick}
        />
      )}
      {view === 'mes' && (
        <MonthView
          cursor={cursor}
          bookings={bookings}
          communityId={communityId}
          currentUserId={currentUserId}
          onPickDay={(d) => {
            setCursor(d);
            setView('semana');
          }}
        />
      )}
      {view === 'agenda' && (
        <AgendaView
          bookings={bookings}
          communityId={communityId}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
