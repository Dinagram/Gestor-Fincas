'use client';

import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';

import { registerAttachment } from '@/actions/issues';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase/browser';

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

interface Props {
  communityId: string;
  issueId: string;
  onUploaded?: () => void;
}

export function AttachmentUploader({ communityId, issueId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<File | null>(null);

  async function upload(file: File) {
    // Client-side validation
    if (!ALLOWED_MIME.has(file.type)) {
      toast.error('Tipo de archivo no permitido. Usa imágenes, PDF o documentos Office.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('El archivo supera el límite de 20 MB.');
      return;
    }

    setPending(file);
    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const ext = file.name.split('.').pop() ?? '';
      const uniqueName = `${crypto.randomUUID()}${ext ? `.${ext}` : ''}`;
      const storagePath = `${communityId}/attachments/${issueId}/${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from('incidence-attachments')
        .upload(storagePath, file, { contentType: file.type });

      if (uploadError) {
        toast.error(`Error al subir el archivo: ${uploadError.message}`);
        return;
      }

      const result = await registerAttachment({
        issueId,
        storagePath,
        fileName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
      });

      if (!result.ok) {
        toast.error(result.error);
        // Attempt to clean up the uploaded file
        await supabase.storage.from('incidence-attachments').remove([storagePath]);
        return;
      }

      toast.success(`${file.name} adjuntado`);
      onUploaded?.();
    } finally {
      setUploading(false);
      setPending(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        className="sr-only"
        aria-label="Adjuntar archivo"
        onChange={handleChange}
        disabled={uploading}
      />
      {pending ? (
        <div className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
          <span className="max-w-32 truncate">{pending.name}</span>
          <button
            type="button"
            onClick={() => {
              setPending(null);
              setUploading(false);
              if (inputRef.current) inputRef.current.value = '';
            }}
            aria-label="Cancelar adjunto"
            className="ml-1 rounded-sm hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          aria-label="Adjuntar archivo"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}
