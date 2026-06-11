import { z } from 'zod';

export const pisoSchema = z
  .string()
  .min(1, 'El piso es obligatorio')
  .regex(/^\d{1,2}[A-Za-z]$/, 'Formato inválido. Ejemplos válidos: 1A, 5J, 13C, 14E')
  .superRefine((val, ctx) => {
    const floor = parseInt(val.slice(0, -1), 10);
    const letter = val.slice(-1).toUpperCase();
    const letterIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0); // 0=A, 9=J, ...

    if (floor < 1 || floor > 14) {
      ctx.addIssue({ code: 'custom', message: 'El número de piso debe estar entre 1 y 14' });
      return;
    }

    if (floor === 14 && letterIndex > 4) {
      ctx.addIssue({ code: 'custom', message: 'Para el piso 14, las letras permitidas son de la A a la E' });
    } else if (floor <= 13 && letterIndex > 9) {
      ctx.addIssue({ code: 'custom', message: 'Las letras permitidas son de la A a la J' });
    }
  });

export function parsePiso(piso: string): { floor: string; door: string } {
  const normalized = piso.trim().toUpperCase();
  const floor = normalized.slice(0, -1);
  const door = normalized.slice(-1);
  return { floor, door };
}

export type PisoInput = z.infer<typeof pisoSchema>;
