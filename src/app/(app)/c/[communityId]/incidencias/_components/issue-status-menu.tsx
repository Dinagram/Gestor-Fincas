'use client';

import { useTransition } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleGate } from '@/components/shared/role-gate';
import { ISSUE_STATUSES, ISSUE_STATUS_LABEL } from '@/lib/constants';
import { changeIssueStatus } from '@/actions/issues';
import type { Database } from '@/types/database';

type IssueStatus = Database['public']['Tables']['issues']['Row']['status'];

interface Props {
  issueId: string;
  current: IssueStatus;
}

export function IssueStatusMenu({ issueId, current }: Props) {
  const [pending, startTransition] = useTransition();

  function handleChange(next: IssueStatus) {
    if (next === current) return;
    startTransition(async () => {
      const result = await changeIssueStatus({ issueId, newStatus: next });
      if (!result.ok) toast.error(result.error);
      else toast.success(`Estado cambiado a "${ISSUE_STATUS_LABEL[next]}"`);
    });
  }

  return (
    <RoleGate action="issue.change_status">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cambiar estado'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {ISSUE_STATUSES.map((s) => (
            <DropdownMenuItem
              key={s}
              disabled={s === current}
              onClick={() => handleChange(s)}
            >
              {ISSUE_STATUS_LABEL[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </RoleGate>
  );
}
