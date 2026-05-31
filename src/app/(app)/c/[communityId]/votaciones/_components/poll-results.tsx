import { CheckCircle2, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PollResultsProps {
  favor: number;
  contra: number;
  abstencion: number;
  quorumPercent: number;
  eligibleCount?: number;
  status: 'draft' | 'active' | 'closed' | 'cancelled';
}

function ResultBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground">({count} votos)</span>
          <span className="w-10 text-right font-semibold tabular-nums">{pct}%</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PollResults({
  favor,
  contra,
  abstencion,
  quorumPercent,
  eligibleCount = 24,
  status,
}: PollResultsProps) {
  const totalVotes = favor + contra + abstencion;
  const participationPct =
    eligibleCount > 0 ? Math.round((totalVotes / eligibleCount) * 100) : 0;
  const quorumReached = participationPct >= quorumPercent;
  const approved = favor > contra;

  return (
    <div className="space-y-5">
      {/* Verdict badge when closed */}
      {status === 'closed' && totalVotes > 0 && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-3',
            approved && quorumReached
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
          )}
        >
          {approved && quorumReached ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <p className="text-sm font-medium">
            {approved && quorumReached
              ? 'Propuesta aprobada por mayoría'
              : !quorumReached
                ? 'Propuesta rechazada — quórum no alcanzado'
                : 'Propuesta rechazada por mayoría'}
          </p>
        </div>
      )}

      {/* Vote bars */}
      <div className="space-y-3">
        <ResultBar label="A favor" count={favor} total={totalVotes} color="bg-emerald-500" />
        <ResultBar label="En contra" count={contra} total={totalVotes} color="bg-rose-400" />
        <ResultBar label="Abstención" count={abstencion} total={totalVotes} color="bg-zinc-300 dark:bg-zinc-600" />
      </div>

      {/* Participation + quorum */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Participación</span>
          <span className="text-sm font-semibold tabular-nums">
            {totalVotes} / {eligibleCount} ({participationPct}%)
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1.5',
            quorumReached
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
              : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
          )}
        >
          <span className="text-xs text-muted-foreground">Quórum</span>
          <span
            className={cn(
              'text-sm font-semibold tabular-nums',
              quorumReached ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300',
            )}
          >
            {participationPct}% / {quorumPercent}%{' '}
            {quorumReached ? '✓' : 'pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
}
