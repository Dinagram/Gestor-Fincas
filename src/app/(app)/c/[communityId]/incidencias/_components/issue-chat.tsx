'use client';

import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import { AvatarGradient } from '@/components/shared/avatar-gradient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { commentIssue } from '@/actions/issues';
import { relativeTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@/lib/supabase/browser';

export interface ChatMessage {
  id: string;
  body: string;
  isSystem: boolean;
  createdAt: string;
  authorId: string | null;
  authorName: string | null;
  authorEmail: string | null;
}

interface Props {
  issueId: string;
  communityId: string;
  currentUserId: string | null;
  initialMessages: ChatMessage[];
}

export function IssueChat({ issueId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [optimistic, addOptimistic] = useOptimistic<ChatMessage[], ChatMessage>(
    messages,
    (state, next) => [...state, next],
  );
  const [body, setBody] = useState('');
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Realtime: subscribe to new comments.
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`issue:${issueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issue_comments',
          filter: `issue_id=eq.${issueId}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string;
            body: string;
            is_system: boolean;
            created_at: string;
            author_id: string | null;
          };
          // Skip if we already rendered it (e.g. local insert).
          if (messages.some((m) => m.id === row.id)) return;

          // Fetch author profile so we can render the name.
          let authorName: string | null = null;
          let authorEmail: string | null = null;
          if (row.author_id) {
            const { data } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', row.author_id)
              .maybeSingle();
            authorName = data?.full_name ?? null;
            authorEmail = data?.email ?? null;
          }
          setMessages((prev) => [
            ...prev,
            {
              id: row.id,
              body: row.body,
              isSystem: row.is_system,
              createdAt: row.created_at,
              authorId: row.author_id,
              authorName,
              authorEmail,
            },
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [issueId, messages]);

  // Auto-scroll on new message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [optimistic.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || pending) return;

    const tempId = `temp-${Date.now()}`;

    startTransition(async () => {
      addOptimistic({
        id: tempId,
        body: trimmed,
        isSystem: false,
        createdAt: new Date().toISOString(),
        authorId: currentUserId,
        authorName: 'Tú',
        authorEmail: null,
      });
      setBody('');

      const result = await commentIssue({ issueId, body: trimmed });
      if (!result.ok) {
        toast.error(result.error);
        setBody(trimmed);
      }
    });
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <header className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Conversación</h3>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {optimistic.length === 0 && (
          <p className="text-sm text-muted-foreground">Sé el primero en comentar.</p>
        )}
        {optimistic.map((m) => {
          if (m.isSystem) {
            return (
              <div key={m.id} className="text-center text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-0.5">{m.body}</span>
              </div>
            );
          }
          const mine = m.authorId === currentUserId;
          return (
            <div key={m.id} className={cn('flex gap-2', mine && 'flex-row-reverse')}>
              <AvatarGradient name={m.authorName ?? m.authorEmail} className="h-7 w-7 text-[10px]" />
              <div className={cn('max-w-[75%] space-y-1', mine && 'items-end text-right')}>
                <p className="text-xs text-muted-foreground">
                  <strong>{m.authorName ?? 'Sin nombre'}</strong> · {relativeTime(m.createdAt)}
                </p>
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    mine
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground',
                  )}
                >
                  {m.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t p-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un mensaje…"
          rows={2}
          className="min-h-[44px] flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={pending}
        />
        <Button type="submit" size="icon" disabled={pending || !body.trim()}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </Card>
  );
}
