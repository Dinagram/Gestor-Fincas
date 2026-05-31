import { z } from 'zod';

import {
  BOOKING_CATEGORIES,
  ROOM_CLOSE_HOUR,
  ROOM_OPEN_HOUR,
} from '@/lib/constants';

const hourRange = z.coerce
  .number()
  .int('Hora inválida')
  .min(ROOM_OPEN_HOUR, `La sala abre a las ${ROOM_OPEN_HOUR}:00`)
  .max(ROOM_CLOSE_HOUR, `La sala cierra a las ${ROOM_CLOSE_HOUR}:00`);

// ---------------------------------------------------------------------
// Crear reserva (vecino)
// ---------------------------------------------------------------------
export const createBookingSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida'),
    startHour: hourRange,
    endHour: hourRange,
    purpose: z
      .string()
      .min(3, 'Indica el motivo de uso (mín. 3 caracteres)')
      .max(160, 'Máximo 160 caracteres'),
    category: z.enum(BOOKING_CATEGORIES as [string, ...string[]]).default('otro'),
    attendees: z.coerce
      .number()
      .int()
      .min(1, 'Mínimo 1 asistente')
      .max(500, 'Número de asistentes demasiado alto')
      .optional(),
    rulesAccepted: z.boolean().refine((v) => v === true, {
      message: 'Debes leer y aceptar las normas de uso',
    }),
  })
  .refine((d) => d.endHour > d.startHour, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['endHour'],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ---------------------------------------------------------------------
// Cancelar reserva
// ---------------------------------------------------------------------
export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

// ---------------------------------------------------------------------
// Acciones de administración
// ---------------------------------------------------------------------
export const communityEventSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida'),
    startHour: hourRange,
    endHour: hourRange,
    purpose: z.string().min(3, 'Indica el motivo del evento').max(160),
    category: z.enum(BOOKING_CATEGORIES as [string, ...string[]]).default('reunion'),
    attendees: z.coerce.number().int().min(1).max(500).optional(),
  })
  .refine((d) => d.endHour > d.startHour, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['endHour'],
  });

export type CommunityEventInput = z.infer<typeof communityEventSchema>;

export const blockSlotSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida'),
    startHour: hourRange,
    endHour: hourRange,
    reason: z.string().min(3, 'Indica el motivo del bloqueo').max(160),
  })
  .refine((d) => d.endHour > d.startHour, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['endHour'],
  });

export type BlockSlotInput = z.infer<typeof blockSlotSchema>;

export const setOutOfServiceSchema = z.object({
  roomId: z.string().uuid(),
  outOfService: z.boolean(),
  reason: z.string().max(200).optional(),
});

export type SetOutOfServiceInput = z.infer<typeof setOutOfServiceSchema>;

export const moderateBookingSchema = z.object({
  bookingId: z.string().uuid(),
  decision: z.enum(['confirmar', 'rechazar']),
});

export type ModerateBookingInput = z.infer<typeof moderateBookingSchema>;
