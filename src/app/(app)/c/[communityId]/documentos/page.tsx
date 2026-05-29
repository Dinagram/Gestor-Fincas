import { FolderArchive } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';

export default function DocumentosPage() {
  return (
    <div className="container space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Documentos</h1>
        <p className="text-sm text-muted-foreground">Disponible en Fase 4.</p>
      </header>
      <EmptyState icon={FolderArchive} title="Próximamente" />
    </div>
  );
}
