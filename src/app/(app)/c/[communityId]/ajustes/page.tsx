import { Settings } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';

export default function AjustesPage() {
  return (
    <div className="container space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">Ajustes de la comunidad y miembros.</p>
      </header>
      <EmptyState icon={Settings} title="Próximamente" />
    </div>
  );
}
