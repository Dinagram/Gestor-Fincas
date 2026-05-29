import Link from 'next/link';
import { Plus, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { createServerClient } from '@/lib/supabase/server';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '@/lib/constants';
import type { Database } from '@/types/database';

import { IssueFilters } from './_components/issue-filters';
import { IssueCard } from './_components/issue-card';

type Params = Promise<{ communityId: string }>;
type Search = Promise<{ estado?: string; categoria?: string; prioridad?: string; q?: string }>;

type IssueStatus = Database['public']['Tables']['issues']['Row']['status'];
type IssueCategory = Database['public']['Tables']['issues']['Row']['category'];
type IssuePriority = Database['public']['Tables']['issues']['Row']['priority'];

export default async function IssuesListPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { communityId } = await params;
  const filters = await searchParams;

  const supabase = await createServerClient();
  let query = supabase
    .from('issues')
    .select(
      'id, code, title, status, priority, category, created_at, created_by, profiles!issues_created_by_fkey(full_name)',
    )
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (filters.estado && (ISSUE_STATUSES as string[]).includes(filters.estado)) {
    query = query.eq('status', filters.estado as IssueStatus);
  }
  if (filters.categoria && (ISSUE_CATEGORIES as string[]).includes(filters.categoria)) {
    query = query.eq('category', filters.categoria as IssueCategory);
  }
  if (filters.prioridad && (ISSUE_PRIORITIES as string[]).includes(filters.prioridad)) {
    query = query.eq('priority', filters.prioridad as IssuePriority);
  }
  if (filters.q) {
    query = query.ilike('title', `%${filters.q}%`);
  }

  const { data: issues } = await query;

  return (
    <div className="container space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incidencias</h1>
          <p className="text-sm text-muted-foreground">
            {issues?.length ?? 0} incidencia{issues?.length === 1 ? '' : 's'} encontradas
          </p>
        </div>
        <Button asChild>
          <Link href={`/c/${communityId}/incidencias/nueva`}>
            <Plus className="h-4 w-4" />
            Nueva incidencia
          </Link>
        </Button>
      </header>

      <IssueFilters />

      {(issues?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Sin incidencias"
          description="Aún no hay incidencias que coincidan con los filtros."
          action={
            <Button asChild>
              <Link href={`/c/${communityId}/incidencias/nueva`}>Crear la primera</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {issues!.map((it) => {
            const profile = Array.isArray(it.profiles) ? it.profiles[0] : it.profiles;
            return (
              <IssueCard
                key={it.id}
                communityId={communityId}
                id={it.id}
                code={it.code}
                title={it.title}
                status={it.status}
                priority={it.priority}
                category={it.category}
                createdAt={it.created_at}
                authorName={profile?.full_name ?? null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
