import { ChevronRight, Download, File, FileArchive, FileImage, FileText } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from '@/components/shared/empty-state';
import type { DocumentFolder, DocumentRow } from '../_lib/constants';
import { FOLDER_META } from '../_lib/constants';
import { UploadForm } from './upload-form';

interface Props {
  communityId: string;
  folder: DocumentFolder;
  documents: DocumentRow[];
  canUpload: boolean;
}

const DATE_FMT = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatDate(dateStr: string) {
  try {
    return DATE_FMT.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatSize(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string | null }) {
  if (!mimeType) return <File className="h-4 w-4 text-muted-foreground" />;
  if (mimeType.startsWith('image/')) return <FileImage className="h-4 w-4 text-blue-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
  if (mimeType.includes('zip') || mimeType.includes('rar'))
    return <FileArchive className="h-4 w-4 text-amber-500" />;
  return <FileText className="h-4 w-4 text-muted-foreground" />;
}

export function FolderContent({ communityId, folder, documents, canUpload }: Props) {
  const meta = FOLDER_META[folder];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Link
              href={`/c/${communityId}/documentos`}
              className="transition-colors hover:text-foreground"
            >
              Documentos
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{meta.label}</span>
          </nav>
          <p className="text-sm text-muted-foreground">
            {documents.length} {documents.length === 1 ? 'archivo' : 'archivos'}
          </p>
        </div>
        {canUpload && (
          <UploadForm communityId={communityId} folder={folder} />
        )}
      </header>

      {/* Document list */}
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Carpeta vacía"
          description={
            canUpload
              ? 'Sube el primer archivo usando el botón de arriba.'
              : 'Aún no hay archivos en esta carpeta.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nombre
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
                    Subido por
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">
                    Fecha
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell">
                    Tamaño
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.map((doc) => (
                  <tr key={doc.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <FileIcon mimeType={doc.mimeType} />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {doc.uploadedByName ?? '—'}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-muted-foreground tabular-nums lg:table-cell">
                      {formatSize(doc.sizeBytes)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {doc.signedUrl ? (
                        <a
                          href={doc.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={doc.name}
                          className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-muted"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Descargar
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
