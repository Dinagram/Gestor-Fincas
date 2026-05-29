import { Users } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';

export default function DirectorioPage() {
  return (
    <div className="container space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Directorio</h1>
        <p className="text-sm text-muted-foreground">
          Vecinos y unidades del edificio. Disponible en Fase 4.
        </p>
      </header>
      <EmptyState
        icon={Users}
        title="Próximamente"
        description="Vista tabla + vista plano del edificio en preparación."
      />
    </div>
  );
}
