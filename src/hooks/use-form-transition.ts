'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseFormTransitionOptions {
  /** Mensaje de toast al completar con éxito. */
  successMessage?: string;
  /**
   * Callback adicional al completar con éxito.
   * Úsalo para redirigir, cerrar diálogos, etc.
   * Si no se proporciona, se llama a router.refresh() automáticamente.
   */
  onSuccess?: () => void;
}

/**
 * Encapsula el patrón repetido en todos los formularios de mutación:
 * startTransition → llamar Server Action → toast de error/éxito → refresh/redirect.
 *
 * La acción puede devolver { ok: false; error: string } (error) o
 * { ok: true } (éxito). También maneja el caso en que el Server Action
 * llama a redirect() internamente (result es undefined).
 */
export function useFormTransition<T>(
  action: (data: T) => Promise<{ ok: boolean; error?: string } | undefined>,
  options?: UseFormTransitionOptions,
) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function submit(data: T) {
    setError(undefined);
    startTransition(async () => {
      const result = await action(data);
      // result es undefined cuando el Server Action llama a redirect() internamente.
      if (!result || !result.ok) {
        const msg = result?.error;
        if (msg) {
          setError(msg);
          toast.error(msg);
        }
        return;
      }
      if (options?.successMessage) toast.success(options.successMessage);
      if (options?.onSuccess) {
        options.onSuccess();
      } else {
        router.refresh();
      }
    });
  }

  return { submit, error, setError, pending };
}
