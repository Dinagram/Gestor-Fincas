import { Gauge } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';

export default function PresupuestoPage() {
  return (
    <div className="container space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Presupuesto</h1>
        <p className="text-sm text-muted-foreground">Disponible en Fase 4.</p>
      </header>
      <EmptyState icon={Gauge} title="Próximamente" />
    </div>
  );
}
