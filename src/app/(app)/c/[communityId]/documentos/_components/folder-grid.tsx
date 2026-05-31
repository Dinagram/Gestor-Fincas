import Link from 'next/link';
import { Award, BookOpen, FileSignature, FileText, FolderOpen, Shield } from 'lucide-react';

import type { DocumentFolder } from '../_lib/constants';
import { FOLDER_META } from '../_lib/constants';

const FOLDER_ICONS: Record<DocumentFolder, React.ComponentType<{ className?: string }>> = {
  actas: FileText,
  estatutos: BookOpen,
  seguros: Shield,
  contratos: FileSignature,
  certificados: Award,
  otros: FolderOpen,
};

interface Props {
  communityId: string;
  counts: Map<DocumentFolder, number>;
}

export function FolderGrid({ communityId, counts }: Props) {
  const folders = Object.keys(FOLDER_META) as DocumentFolder[];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {folders.map((folder) => {
        const meta = FOLDER_META[folder];
        const Icon = FOLDER_ICONS[folder];
        const count = counts.get(folder) ?? 0;

        return (
          <Link
            key={folder}
            href={`/c/${communityId}/documentos?folder=${folder}`}
            className="group flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {count} {count === 1 ? 'archivo' : 'archivos'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                {meta.label}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
