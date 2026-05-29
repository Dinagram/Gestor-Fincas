import { Megaphone } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { relativeTime } from '@/lib/date';
import { Badge } from '@/components/ui/badge';

type Params = Promise<{ communityId: string }>;

export default async function ComunicadosPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const supabase = await createServerClient();

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, type, title, body, sent_at, requires_ack')
    .eq('community_id', communityId)
    .order('sent_at', { ascending: false });

  return (
    <div className="container space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Comunicados</h1>
        <p className="text-sm text-muted-foreground">
          Avisos oficiales, convocatorias y resoluciones.
        </p>
      </header>

      {(announcements?.length ?? 0) === 0 ? (
        <EmptyState icon={Megaphone} title="Aún no hay comunicados" />
      ) : (
        <div className="space-y-3">
          {announcements!.map((a) => (
            <Card key={a.id} className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <Badge variant={a.type === 'urgente' ? 'destructive' : 'secondary'}>
                  {a.type}
                </Badge>
                {a.requires_ack && <Badge variant="outline">Requiere acuse</Badge>}
                <span className="text-xs text-muted-foreground">
                  {relativeTime(a.sent_at)}
                </span>
              </div>
              <h2 className="font-semibold">{a.title}</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
