import { z } from 'zod';

export const updateCommunitySchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z
    .string()
    .regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos')
    .optional()
    .or(z.literal('')),
  cif: z.string().optional(),
});

export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;
