'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { signAttachmentUrl } from '@/actions/issues';
import { Button } from '@/components/ui/button';

interface Props {
  storagePath: string;
  fileName: string;
}

export function DownloadButton({ storagePath, fileName }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const result = await signAttachmentUrl(storagePath);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDownload}
      disabled={loading}
      aria-label={`Descargar ${fileName}`}
      className="h-7 w-7 shrink-0"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Download className="h-3.5 w-3.5" aria-hidden />
      )}
    </Button>
  );
}
