import { FileText, Image } from 'lucide-react';

import { DownloadButton } from './download-button';
import type { Database } from '@/types/database';

type IssueAttachment = Database['public']['Tables']['issue_attachments']['Row'];

interface Props {
  attachments: IssueAttachment[];
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string | null): boolean {
  return !!mimeType?.startsWith('image/');
}

export function AttachmentList({ attachments }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Adjuntos ({attachments.length})
      </p>
      <div className="space-y-1">
        {attachments.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
          >
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                isImage(a.mime_type)
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
              }`}
            >
              {isImage(a.mime_type) ? (
                <Image className="h-4 w-4" aria-hidden />
              ) : (
                <FileText className="h-4 w-4" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{a.file_name}</p>
              {a.size_bytes && (
                <p className="text-xs text-muted-foreground">{formatBytes(a.size_bytes)}</p>
              )}
            </div>
            <DownloadButton storagePath={a.storage_path} fileName={a.file_name} />
          </div>
        ))}
      </div>
    </div>
  );
}
