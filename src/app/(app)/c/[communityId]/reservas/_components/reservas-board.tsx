'use client';

import { useState } from 'react';

import { BookingCalendar } from './booking-calendar';
import { BookingDialog } from './booking-dialog';
import { MyBookings } from './my-bookings';
import { RoomStatusBanner } from './room-status-banner';
import type { BookingView, RoomRulesView, RoomView } from '../_lib/types';

interface Props {
  communityId: string;
  room: RoomView;
  rules: RoomRulesView;
  bookings: BookingView[];
  currentUserId: string;
  currentBooking: BookingView | null;
}

export function ReservasBoard({
  communityId,
  room,
  rules,
  bookings,
  currentUserId,
  currentBooking,
}: Props) {
  const [open, setOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [prefillHour, setPrefillHour] = useState<number | undefined>();

  const myBookings = bookings.filter((b) => b.createdBy === currentUserId);

  function openReserve() {
    setPrefillDate(undefined);
    setPrefillHour(undefined);
    setOpen(true);
  }

  function openSlot(date: string, hour: number) {
    setPrefillDate(date);
    setPrefillHour(hour);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <RoomStatusBanner room={room} currentBooking={currentBooking} onReserve={openReserve} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <BookingCalendar
            communityId={communityId}
            room={room}
            bookings={bookings}
            currentUserId={currentUserId}
            onSlotClick={openSlot}
          />
          <Legend />
        </div>

        <aside className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Mis reservas</h2>
          <MyBookings communityId={communityId} bookings={myBookings} />
        </aside>
      </div>

      <BookingDialog
        communityId={communityId}
        room={room}
        rules={rules}
        bookings={bookings}
        open={open}
        onOpenChange={setOpen}
        initialDate={prefillDate}
        initialStartHour={prefillHour}
      />
    </div>
  );
}

function Legend() {
  const items = [
    { label: 'Reserva vecinal', cls: 'border-dd-terracota/40 bg-dd-terracota/10' },
    { label: 'Evento comunitario', cls: 'border-blue-300 bg-blue-100 dark:border-blue-800 dark:bg-blue-950' },
    { label: 'Pendiente', cls: 'border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950' },
    { label: 'Bloqueo', cls: 'border-dd-taupe/40 bg-dd-taupe/15' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-xs text-muted-foreground">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded border ${it.cls}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
