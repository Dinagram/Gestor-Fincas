import Link from 'next/link';

import { AvatarGradient } from '@/components/shared/avatar-gradient';
import { IssuePriorityPill, IssueStatusPill } from '@/components/shared/status-pill';
import { Card } from '@/components/ui/card';
import { ISSUE_CATEGORY_LABEL } from '@/lib/constants';
import { relativeTime } from '@/lib/date';
import type { Database } from '@/types/database';

type IssueRow = Database['public']['Tables']['issues']['Row'];

interface Props {
  communityId: string;
  id: string;
  code: string;
  title: string;
  status: IssueRow['status'];
  priority: IssueRow['priority'];
  category: IssueRow['category'];
  createdAt: string;
  authorName: string | null;
}

export function IssueCard({
  communityId,
  id,
  code,
  title,
  status,
  priority,
  category,
  createdAt,
  authorName,
}: Props) {
  return (
    <Link href={`/c/${communityId}/incidencias/${id}`} className="block">
      <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40">
        <AvatarGradient name={authorName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{code}</span>
            <p className="truncate font-medium">{title}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {ISSUE_CATEGORY_LABEL[category]} · {authorName ?? 'Anónimo'} · {relativeTime(createdAt)}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <IssuePriorityPill priority={priority} />
          <IssueStatusPill status={status} />
        </div>
      </Card>
    </Link>
  );
}
