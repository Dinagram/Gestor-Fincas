import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { NewIssueForm } from '../_components/new-issue-form';

type Params = Promise<{ communityId: string }>;

export default async function NewIssuePage({ params }: { params: Params }) {
  const { communityId } = await params;

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
        <Link href={`/c/${communityId}/incidencias`}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </Button>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nueva incidencia</h1>
        <p className="text-sm text-muted-foreground">
          Describe el problema con el mayor detalle posible. Cualquier vecino o miembro de la junta
          podrá ver y comentar.
        </p>
      </div>

      <Card className="p-6">
        <NewIssueForm communityId={communityId} />
      </Card>
    </div>
  );
}
