import { z } from 'zod';

import { POLL_TYPES } from '@/lib/constants';

export const createPollSchema = z
  .object({
    title: z.string().min(3, 'Mínimo 3 caracteres').max(160, 'Máximo 160 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
    type: z.enum(POLL_TYPES as [string, ...string[]]),
    starts_at: z.string().min(1, 'La fecha de inicio es obligatoria'),
    ends_at: z.string().min(1, 'La fecha de fin es obligatoria'),
    quorum_percent: z.coerce
      .number()
      .min(1, 'El quórum mínimo es 1%')
      .max(100, 'El quórum máximo es 100%')
      .default(50),
    amount: z.coerce.number().positive('El importe debe ser positivo').optional(),
  })
  .refine((d) => new Date(d.ends_at) > new Date(d.starts_at), {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['ends_at'],
  })
  .refine((d) => d.type !== 'budget' || d.amount != null, {
    message: 'El importe es obligatorio para votaciones de presupuesto',
    path: ['amount'],
  });

export const castVoteSchema = z.object({
  pollId: z.string().uuid(),
  choice: z.enum(['favor', 'contra', 'abstencion']),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type CastVoteInput = z.infer<typeof castVoteSchema>;
