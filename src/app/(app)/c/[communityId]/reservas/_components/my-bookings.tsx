'use client';

import Link from 'next/link';
import { CalendarX2, Clock, Users, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BOOKING_CATEGORY_LABEL } from '@/lib/constants';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';

import { BookingStatusPill } from './booking-status-pill';
import { CancelBookingDialog } from './cancel-booking-dialog';
import { bookingDotClass } from '../_lib/calendar';
import type { BookingView } from '../_lib/types';

interface Props {
  communityId: string;
  bookings: BookingView[];
}

function isUpcoming(b: BookingView): boolean {
  return (
    (b.status === 'confirmada' || b.status === 'pendiente') &&
    new Date(b.endsAt).getTime() > Date.now()
  );
}

function Row({
  communityId,
  b,
  cancelable,
}: {
  communityId: string;
  b: BookingView;
  cancelable: boolean;
}) {
  const start = new Date(b.startsAt);
  const end = new Date(b.endsAt);
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40">
      <span className={cn('mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full', bookingDotClass(b))} />
      <Link href={`/c/${communityId}/reservas/${b.id}`} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-medium">{b.purpose}</span>
          <BookingStatusPill status={b.status} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(start, "EEE d 'de' MMM")} · {formatDate(start, 'HH:mm')}–
            {formatDate(end, 'HH:mm')}
          </span>
          <span>{BOOKING_CATEGORY_LABEL[b.category]}</span>
          {b.attendees != null && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {b.attendees}
            </span>
          )}
        </div>
      </Link>
      {cancelable && (
        <CancelBookingDialog
          communityId={communityId}
          bookingId={b.id}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancelar</span>
            </Button>
          }
        />
      )}
    </div>
  );
}

export function MyBookings({ communityId, bookings }: Props) {
  const upcoming = bookings
    .filter(isUpcoming)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  const history = bookings
    .filter((b) => !isUpcoming(b))
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));

  return (
    <Tabs defaultValue="proximas">
      <TabsList>
        <TabsTrigger value="proximas">Próximas ({upcoming.length})</TabsTrigger>
        <TabsTrigger value="historial">Historial ({history.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="proximas" className="space-y-2">
        {upcoming.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            No tienes reservas próximas.
          </p>
        ) : (
          upcoming.map((b) => (
            <Row key={b.id} communityId={communityId} b={b} cancelable />
          ))
        )}
      </TabsContent>

      <TabsContent value="historial" className="space-y-2">
        {history.length === 0 ? (
          <p className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            <CalendarX2 className="h-5 w-5" />
            Aún no hay reservas en tu historial.
          </p>
        ) : (
          history.map((b) => (
            <Row key={b.id} communityId={communityId} b={b} cancelable={false} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
