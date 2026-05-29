import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';

import { AvatarGradient } from '@/components/shared/avatar-gradient';
import { IssuePriorityPill, IssueStatusPill } from '@/components/shared/status-pill';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createServerClient } from '@/lib/supabase/server';
import { ISSUE_CATEGORY_LABEL, ISSUE_STATUS_LABEL } from '@/lib/constants';
import { formatDateTime, relativeTime } from '@/lib/date';

import { IssueChat } from '../_components/issue-chat';
import { IssueStatusMenu } from '../_components/issue-status-menu';
import { IssueSupportButton } from '../_components/issue-support-button';

type Params = Promise<{ communityId: string; id: string }>;

export default async function IssueDetailPage({ params }: { params: Params }) {
  const { communityId, id } = await params;
  const supabase = await createServerClient();

  const { data: issue } = await supabase
    .from('issues')
    .select(
      `
      *,
      author:profiles!issues_created_by_fkey(id, full_name, email)
    `,
    )
    .eq('id', id)
    .eq('community_id', communityId)
    .maybeSingle();

  if (!issue) notFound();

  const [commentsRes, historyRes, supportRes, mySupportRes, userRes] = await Promise.all([
    supabase
      .from('issue_comments')
      .select('id, body, is_system, created_at, author_id, profiles!issue_comments_author_id_fkey(full_name, email)')
      .eq('issue_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('issue_status_history')
      .select('id, from_status, to_status, note, created_at, profiles!issue_status_history_changed_by_fkey(full_name)')
      .eq('issue_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('issue_supports')
      .select('profile_id', { count: 'exact', head: true })
      .eq('issue_id', id),
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return { count: 0 };
      const { count } = await supabase
        .from('issue_supports')
        .select('profile_id', { count: 'exact', head: true })
        .eq('issue_id', id)
        .eq('profile_id', data.user.id);
      return { count: count ?? 0 };
    }),
    supabase.auth.getUser(),
  ]);

  const supportCount = supportRes.count ?? 0;
  const mySupported = (mySupportRes.count ?? 0) > 0;
  const author = Array.isArray(issue.author) ? issue.author[0] : issue.author;

  const initialMessages = (commentsRes.data ?? []).map((c) => {
    const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    return {
      id: c.id,
      body: c.body,
      isSystem: c.is_system,
      createdAt: c.created_at,
      authorId: c.author_id,
      authorName: p?.full_name ?? null,
      authorEmail: p?.email ?? null,
    };
  });

  return (
    <div className="container max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
            <Link href={`/c/${communityId}/incidencias`}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{issue.code}</span>
            <IssueStatusPill status={issue.status} />
            <IssuePriorityPill priority={issue.priority} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{issue.title}</h1>
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            {ISSUE_CATEGORY_LABEL[issue.category]}
            {issue.location && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {issue.location}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IssueSupportButton
            issueId={issue.id}
            initialSupported={mySupported}
            initialCount={supportCount}
          />
          <IssueStatusMenu issueId={issue.id} current={issue.status} />
        </div>
      </div>

      {issue.description && (
        <Card className="p-4 text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{issue.description}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Reportado por <strong>{author?.full_name ?? 'Anónimo'}</strong> ·{' '}
            {formatDateTime(issue.created_at)}
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <IssueChat
          issueId={issue.id}
          communityId={communityId}
          currentUserId={userRes.data.user?.id ?? null}
          initialMessages={initialMessages}
        />

        <aside className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Historial</h3>
            <ol className="space-y-3 text-xs">
              {(historyRes.data ?? []).map((h) => {
                const p = Array.isArray(h.profiles) ? h.profiles[0] : h.profiles;
                return (
                  <li key={h.id} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p>
                        <strong>{p?.full_name ?? 'Sistema'}</strong>{' '}
                        {h.from_status
                          ? `cambió de "${ISSUE_STATUS_LABEL[h.from_status]}" a "${ISSUE_STATUS_LABEL[h.to_status]}"`
                          : `creó la incidencia en estado "${ISSUE_STATUS_LABEL[h.to_status]}"`}
                      </p>
                      <p className="text-muted-foreground">{relativeTime(h.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}
