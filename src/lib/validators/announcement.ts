import { z } from 'zod';

import { ANNOUNCEMENT_TYPES } from '@/lib/constants';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(160, 'Máximo 160 caracteres'),
  body: z.string().min(1, 'El contenido es obligatorio').max(4000, 'Máximo 4000 caracteres'),
  type: z.enum(ANNOUNCEMENT_TYPES as [string, ...string[]]).default('aviso'),
  requires_ack: z.boolean().default(false),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
