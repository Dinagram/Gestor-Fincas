import { Vote } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';

export default function VotacionesPage() {
  return (
    <div className="container space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Votaciones</h1>
        <p className="text-sm text-muted-foreground">
          Decisiones de la comunidad. Disponible en Fase 3.
        </p>
      </header>

      <EmptyState
        icon={Vote}
        title="Próximamente"
        description="El módulo de votaciones forma parte del roadmap Fase 3. El schema y las RLS ya están listos."
      />
    </div>
  );
}
