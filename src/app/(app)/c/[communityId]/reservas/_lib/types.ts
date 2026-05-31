import type { Database } from '@/types/database';

export type BookingStatus = Database['public']['Enums']['booking_status'];
export type BookingCategory = Database['public']['Enums']['booking_category'];
export type BookingKind = Database['public']['Enums']['booking_kind'];
export type RoomStatus = Database['public']['Enums']['room_status'];

/** Vista serializable de una reserva para los componentes cliente. */
export interface BookingView {
  id: string;
  startsAt: string;
  endsAt: string;
  purpose: string;
  category: BookingCategory;
  status: BookingStatus;
  kind: BookingKind;
  attendees: number | null;
  createdBy: string;
  bookedByName: string | null;
  unitLabel: string | null;
  cancelReason: string | null;
}

export interface RoomView {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  status: RoomStatus;
  openHour: number;
  closeHour: number;
  requiresApproval: boolean;
  outOfServiceReason: string | null;
}

export interface RoomRulesView {
  maxPerUnitPerMonth: number;
  minAdvanceHours: number;
  maxDurationHours: number;
  maxAttendees: number | null;
}
