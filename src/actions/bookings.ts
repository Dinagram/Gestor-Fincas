'use server';

import { revalidatePath } from 'next/cache';

import { ERR_NO_ACCESS, getUserRole } from '@/lib/auth/get-user';
import { canDo, isAtLeast } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase/server';
import { ROOM_MAX_PER_MONTH } from '@/lib/constants';
import { checkConflicts } from '@/lib/bookings/check-conflicts';
import {
  blockSlotSchema,
  cancelBookingSchema,
  communityEventSchema,
  createBookingSchema,
  moderateBookingSchema,
  setOutOfServiceSchema,
} from '@/lib/validators/booking';
import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];
type BookingCategory = Database['public']['Enums']['booking_category'];

export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

// createBooking puede devolver alternativas cuando hay solape.
export type CreateBookingResult =
  | { ok: true; id: string; status: BookingStatus }
  | { ok: false; error: string; alternatives?: string[] };

const ACTIVE: BookingStatus[] = ['pendiente', 'confirmada'];

function buildTs(date: string, hour: number): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y!, m! - 1, d!, hour, 0, 0, 0);
}

const fmtHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** Resuelve la sala (única) de la comunidad. */
async function loadRoom(communityId: string) {
  const supabase = await createServerClient();
  const { data: room } = await supabase
    .from('rooms')
    .select('id, status, open_hour, close_hour, requires_approval')
    .eq('community_id', communityId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return room;
}

/** Franjas horarias libres (inicio en horas exactas) de un día dado. */
async function freeSlots(
  communityId: string,
  roomId: string,
  date: string,
  openHour: number,
  closeHour: number,
): Promise<string[]> {
  const supabase = await createServerClient();
  const dayStart = buildTs(date, openHour).toISOString();
  const dayEnd = buildTs(date, closeHour).toISOString();

  const { data: busy } = await supabase
    .from('room_bookings')
    .select('starts_at, ends_at')
    .eq('room_id', roomId)
    .eq('community_id', communityId)
    .in('status', ACTIVE)
    .lt('starts_at', dayEnd)
    .gt('ends_at', dayStart);

  const slots: string[] = [];
  for (let h = openHour; h < closeHour; h++) {
    const s = buildTs(date, h).getTime();
    const e = buildTs(date, h + 1).getTime();
    const overlap = (busy ?? []).some((b) => {
      const bs = new Date(b.starts_at).getTime();
      const be = new Date(b.ends_at).getTime();
      return bs < e && be > s;
    });
    if (!overlap) slots.push(`${fmtHour(h)}–${fmtHour(h + 1)}`);
  }
  return slots;
}

// ====================================================================
// Crear reserva (cualquier miembro)
// ====================================================================
export async function createBooking(
  communityId: string,
  input: unknown,
): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }
  const { date, startHour, endHour, purpose, category, attendees, rulesAccepted } =
    parsed.data;

  let user, role, unitId;
  try {
    ({ user, role, unitId } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!canDo(role, 'booking.create')) {
    return { ok: false, error: 'No tienes permiso para reservar la sala' };
  }
  if (!rulesAccepted) {
    return { ok: false, error: 'Debes leer y aceptar las normas de uso' };
  }

  const room = await loadRoom(communityId);
  if (!room) return { ok: false, error: 'La sala no está disponible' };
  if (room.status === 'fuera_servicio') {
    return { ok: false, error: 'La sala está temporalmente fuera de servicio' };
  }

  // Horario de apertura
  if (startHour < room.open_hour || endHour > room.close_hour) {
    return {
      ok: false,
      error: `El horario de uso es de ${fmtHour(room.open_hour)} a ${fmtHour(room.close_hour)}`,
    };
  }

  const start = buildTs(date, startHour);
  const end = buildTs(date, endHour);

  // Reglas de la sala
  const supabase = await createServerClient();
  const { data: rules } = await supabase
    .from('room_booking_rules')
    .select('max_per_unit_per_month, min_advance_hours, max_duration_hours, max_attendees')
    .eq('room_id', room.id)
    .maybeSingle();

  const minAdvanceHours = rules?.min_advance_hours ?? 48;
  const maxDurationHours = rules?.max_duration_hours ?? 4;
  const maxPerMonth = rules?.max_per_unit_per_month ?? ROOM_MAX_PER_MONTH;

  // Duración máxima
  const durationHours = (end.getTime() - start.getTime()) / 3_600_000;
  if (durationHours > maxDurationHours) {
    return {
      ok: false,
      error: `La duración máxima por reserva es de ${maxDurationHours} horas`,
    };
  }

  // Aforo
  if (rules?.max_attendees && attendees && attendees > rules.max_attendees) {
    return { ok: false, error: `El aforo máximo de la sala es de ${rules.max_attendees} personas` };
  }

  // Antelación mínima (48 h)
  if (start.getTime() - Date.now() < minAdvanceHours * 3_600_000) {
    return {
      ok: false,
      error: `Las reservas deben realizarse con al menos ${minAdvanceHours} horas de antelación`,
    };
  }

  // Solapamientos
  const { hasConflict } = await checkConflicts(communityId, {
    roomId: room.id,
    start,
    end,
  });

  if (hasConflict) {
    const alternatives = await freeSlots(
      communityId,
      room.id,
      date,
      room.open_hour,
      room.close_hour,
    );
    return {
      ok: false,
      error: 'Esa franja ya está reservada. Te mostramos las horas libres de ese día.',
      alternatives,
    };
  }

  // Máximo 2 reservas por vivienda y mes natural
  const monthStart = new Date(start.getFullYear(), start.getMonth(), 1).toISOString();
  const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1).toISOString();
  let countQuery = supabase
    .from('room_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', communityId)
    .eq('room_id', room.id)
    .eq('kind', 'vecino')
    .in('status', ACTIVE)
    .gte('starts_at', monthStart)
    .lt('starts_at', monthEnd);
  countQuery = unitId
    ? countQuery.eq('unit_id', unitId)
    : countQuery.eq('created_by', user.id);
  const { count: monthCount } = await countQuery;

  if ((monthCount ?? 0) >= maxPerMonth) {
    return { ok: false, error: 'Has alcanzado el límite mensual de reservas' };
  }

  const status: BookingStatus = room.requires_approval ? 'pendiente' : 'confirmada';

  const { data, error } = await supabase
    .from('room_bookings')
    .insert({
      community_id: communityId,
      room_id: room.id,
      unit_id: unitId,
      created_by: user.id,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      purpose,
      category: category as BookingCategory,
      attendees: attendees ?? null,
      status,
      kind: 'vecino',
      rules_accepted_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'No se pudo crear la reserva' };
  }

  revalidatePath(`/c/${communityId}/reservas`);
  return { ok: true, id: data.id, status };
}

// ====================================================================
// Cancelar reserva (autor o junta/admin)
// ====================================================================
export async function cancelBooking(
  communityId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = cancelBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let user, role;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }

  const supabase = await createServerClient();
  const { data: booking } = await supabase
    .from('room_bookings')
    .select('created_by, status')
    .eq('id', parsed.data.bookingId)
    .eq('community_id', communityId)
    .maybeSingle();

  if (!booking) return { ok: false, error: 'Reserva no encontrada' };
  if (booking.status === 'cancelada') return { ok: true };

  const isOwner = booking.created_by === user.id;
  if (!isOwner && !canDo(role, 'booking.manage')) {
    return { ok: false, error: 'No puedes cancelar esta reserva' };
  }

  const { error } = await supabase
    .from('room_bookings')
    .update({
      status: 'cancelada',
      cancelled_at: new Date().toISOString(),
      cancel_reason: parsed.data.reason ?? null,
    })
    .eq('id', parsed.data.bookingId)
    .eq('community_id', communityId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/reservas`);
  revalidatePath(`/c/${communityId}/reservas/${parsed.data.bookingId}`);
  return { ok: true };
}

// ====================================================================
// Moderar reserva — aprobar/rechazar (admin_finca)
// ====================================================================
export async function moderateBooking(
  communityId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = moderateBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!isAtLeast(role, 'admin_finca')) {
    return { ok: false, error: 'Solo el administrador puede moderar reservas' };
  }

  const newStatus: BookingStatus =
    parsed.data.decision === 'confirmar' ? 'confirmada' : 'cancelada';

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('room_bookings')
    .update({
      status: newStatus,
      ...(newStatus === 'cancelada'
        ? { cancelled_at: new Date().toISOString(), cancel_reason: 'Rechazada por administración' }
        : {}),
    })
    .eq('id', parsed.data.bookingId)
    .eq('community_id', communityId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/reservas`);
  revalidatePath(`/c/${communityId}/reservas/gestion`);
  return { ok: true };
}

// ====================================================================
// Cambiar modo de aprobación de la sala (admin_finca)
// ====================================================================
export async function setRequiresApproval(
  communityId: string,
  roomId: string,
  value: boolean,
): Promise<ActionResult> {
  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!isAtLeast(role, 'admin_finca')) {
    return { ok: false, error: 'Solo el administrador puede cambiar esta configuración' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('rooms')
    .update({ requires_approval: value })
    .eq('id', roomId)
    .eq('community_id', communityId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/reservas`);
  revalidatePath(`/c/${communityId}/reservas/gestion`);
  return { ok: true };
}

// ====================================================================
// Crear evento comunitario (admin_finca) — salta antelación y cupo
// ====================================================================
export async function createCommunityEvent(
  communityId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = communityEventSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let user, role;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!isAtLeast(role, 'admin_finca')) {
    return { ok: false, error: 'Solo el administrador puede crear eventos comunitarios' };
  }

  const room = await loadRoom(communityId);
  if (!room) return { ok: false, error: 'La sala no está disponible' };

  const { date, startHour, endHour, purpose, category, attendees } = parsed.data;
  const start = buildTs(date, startHour);
  const end = buildTs(date, endHour);

  const supabase = await createServerClient();
  const { hasConflict: eventConflict } = await checkConflicts(communityId, {
    roomId: room.id,
    start,
    end,
  });

  if (eventConflict) {
    return { ok: false, error: 'Esa franja ya está ocupada por otra reserva' };
  }

  const { data, error } = await supabase
    .from('room_bookings')
    .insert({
      community_id: communityId,
      room_id: room.id,
      unit_id: null,
      created_by: user.id,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      purpose,
      category: category as BookingCategory,
      attendees: attendees ?? null,
      status: 'confirmada',
      kind: 'comunidad',
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'No se pudo crear el evento' };
  }

  revalidatePath(`/c/${communityId}/reservas`);
  revalidatePath(`/c/${communityId}/reservas/gestion`);
  return { ok: true, id: data.id };
}

// ====================================================================
// Bloquear franja (admin_finca)
// ====================================================================
export async function blockSlot(
  communityId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = blockSlotSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let user, role;
  try {
    ({ user, role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!isAtLeast(role, 'admin_finca')) {
    return { ok: false, error: 'Solo el administrador puede bloquear franjas' };
  }

  const room = await loadRoom(communityId);
  if (!room) return { ok: false, error: 'La sala no está disponible' };

  const { date, startHour, endHour, reason } = parsed.data;
  const start = buildTs(date, startHour);
  const end = buildTs(date, endHour);

  const supabase = await createServerClient();
  const { hasConflict: slotConflict } = await checkConflicts(communityId, {
    roomId: room.id,
    start,
    end,
  });

  if (slotConflict) {
    return { ok: false, error: 'Esa franja ya tiene reservas. Cancélalas antes de bloquear.' };
  }

  const { data, error } = await supabase
    .from('room_bookings')
    .insert({
      community_id: communityId,
      room_id: room.id,
      unit_id: null,
      created_by: user.id,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      purpose: reason,
      category: 'otro',
      status: 'confirmada',
      kind: 'bloqueo',
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'No se pudo bloquear la franja' };
  }

  revalidatePath(`/c/${communityId}/reservas`);
  revalidatePath(`/c/${communityId}/reservas/gestion`);
  return { ok: true, id: data.id };
}

// ====================================================================
// Marcar sala fuera de servicio / disponible (admin_finca)
// ====================================================================
export async function setRoomOutOfService(
  communityId: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = setOutOfServiceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' };
  }

  let role;
  try {
    ({ role } = await getUserRole(communityId));
  } catch {
    return { ok: false, error: ERR_NO_ACCESS };
  }
  if (!isAtLeast(role, 'admin_finca')) {
    return { ok: false, error: 'Solo el administrador puede cambiar el estado de la sala' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('rooms')
    .update({
      status: parsed.data.outOfService ? 'fuera_servicio' : 'disponible',
      out_of_service_reason: parsed.data.outOfService ? (parsed.data.reason ?? null) : null,
    })
    .eq('id', parsed.data.roomId)
    .eq('community_id', communityId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${communityId}/reservas`);
  revalidatePath(`/c/${communityId}/reservas/gestion`);
  return { ok: true };
}
