'use client';

import { CalendarPlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { BookingForm } from './booking-form';
import type { BookingView, RoomRulesView, RoomView } from '../_lib/types';

interface Props {
  communityId: string;
  room: RoomView;
  rules: RoomRulesView;
  bookings: BookingView[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  initialStartHour?: number;
}

export function BookingDialog({
  communityId,
  room,
  rules,
  bookings,
  open,
  onOpenChange,
  initialDate,
  initialStartHour,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <CalendarPlus className="h-5 w-5 text-dd-terracota" />
            Reservar {room.name}
          </DialogTitle>
          <DialogDescription>
            Completa los datos y acepta las normas. La reserva se confirma al instante.
          </DialogDescription>
        </DialogHeader>
        {/* key fuerza un form nuevo cada vez que cambia la franja preseleccionada */}
        <BookingForm
          key={`${initialDate ?? ''}-${initialStartHour ?? ''}-${open}`}
          communityId={communityId}
          room={room}
          rules={rules}
          bookings={bookings}
          initialDate={initialDate}
          initialStartHour={initialStartHour}
          onCreated={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
