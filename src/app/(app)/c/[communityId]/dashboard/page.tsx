import Link from 'next/link';
import { Megaphone, Users, Vote, Wrench } from 'lucide-react';

import { KpiCard } from '@/components/shared/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IssueStatusPill } from '@/components/shared/status-pill';
import { AvatarGradient } from '@/components/shared/avatar-gradient';
import { createServerClient } from '@/lib/supabase/server';
import { relativeTime } from '@/lib/date';

type Params = Promise<{ communityId: string }>;

export default async function DashboardPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const supabase = await createServerClient();

  const [openIssues, recentIssues, announcements, activePolls] = await Promise.all([
    supabase
      .from('issues')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .in('status', ['abierta', 'en_revision', 'en_curso']),
    supabase
      .from('issues')
      .select('id, code, title, status, priority, created_at, created_by, profiles!issues_created_by_fkey(full_name)')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('announcements')
      .select('id, title, type, sent_at')
      .eq('community_id', communityId)
      .order('sent_at', { ascending: false })
      .limit(3),
    supabase
      .from('polls')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('status', 'active'),
  ]);

  return (
    <div className="container space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
          <p className="text-sm text-muted-foreground">Tu comunidad de un vistazo.</p>
        </div>
        <Button asChild>
          <Link href={`/c/${communityId}/incidencias/nueva`}>Nueva incidencia</Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Incidencias abiertas"
          value={openIssues.count ?? 0}
          icon={Wrench}
          href={`/c/${communityId}/incidencias?estado=abierta`}
          tone="amber"
        />
        <KpiCard
          label="Comunicados recientes"
          value={announcements.data?.length ?? 0}
          icon={Megaphone}
          href={`/c/${communityId}/comunicados`}
          tone="blue"
        />
        <KpiCard
          label="Votaciones activas"
          value={activePolls.count ?? 0}
          icon={Vote}
          href={`/c/${communityId}/votaciones`}
          tone="green"
        />
        <KpiCard
          label="Vecinos"
          value="—"
          icon={Users}
          href={`/c/${communityId}/directorio`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Últimas incidencias</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/c/${communityId}/incidencias`}>Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentIssues.data ?? []).map((it) => {
              const profile = Array.isArray(it.profiles) ? it.profiles[0] : it.profiles;
              return (
                <Link
                  key={it.id}
                  href={`/c/${communityId}/incidencias/${it.id}`}
                  className="flex items-start gap-3 rounded-md border bg-background p-3 transition-colors hover:border-primary/40"
                >
                  <AvatarGradient name={profile?.full_name ?? null} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <span className="text-muted-foreground">{it.code}</span>
                      <span className="truncate">{it.title}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {relativeTime(it.created_at)} · {profile?.full_name ?? 'Anónimo'}
                    </p>
                  </div>
                  <IssueStatusPill status={it.status} className="shrink-0" />
                </Link>
              );
            })}
            {(recentIssues.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Sin incidencias aún.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comunicados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(announcements.data ?? []).map((a) => (
              <div key={a.id} className="rounded-md border bg-background p-3">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.type} · {relativeTime(a.sent_at)}
                </p>
              </div>
            ))}
            {(announcements.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Sin comunicados recientes.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
