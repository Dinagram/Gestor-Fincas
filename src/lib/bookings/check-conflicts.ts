import 'server-only';

import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];

const ACTIVE: BookingStatus[] = ['pendiente', 'confirmada'];

interface ConflictParams {
  roomId: string;
  start: Date;
  end: Date;
}

/**
 * Comprueba si existe alguna reserva activa que se solape con el rango [start, end).
 * Reutiliza la misma lógica de solapamiento en createBooking, createCommunityEvent y blockSlot.
 */
export async function checkConflicts(
  communityId: string,
  { roomId, start, end }: ConflictParams,
): Promise<{ hasConflict: boolean }> {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('room_bookings')
    .select('id')
    .eq('room_id', roomId)
    .eq('community_id', communityId)
    .in('status', ACTIVE)
    .lt('starts_at', end.toISOString())
    .gt('ends_at', start.toISOString())
    .limit(1);

  return { hasConflict: (data?.length ?? 0) > 0 };
}
