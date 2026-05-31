'use client';

import { useActionState, useState } from 'react';
import { Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { uploadDocument } from '@/actions/documents';
import type { DocumentFolder } from '../_lib/constants';

interface Props {
  communityId: string;
  folder: DocumentFolder;
}

const INITIAL_STATE = { error: null as string | null, success: false };

export function UploadForm({ communityId, folder }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    uploadDocument,
    INITIAL_STATE,
  );

  if (state.success && open) setOpen(false);

  if (!open) {
    return (
      <Button variant="default" size="sm" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Subir archivo
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">Subir archivo</span>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="communityId" value={communityId} />
        <input type="hidden" name="folder" value={folder} />

        <input
          type="file"
          name="file"
          required
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
          className="block w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-primary file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
        />

        {state.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? 'Subiendo…' : 'Confirmar subida'}
          </Button>
        </div>
      </form>
    </div>
  );
}
