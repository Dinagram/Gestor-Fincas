'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { createAnnouncement } from '@/actions/announcements';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ANNOUNCEMENT_TYPE_LABEL, ANNOUNCEMENT_TYPES } from '@/lib/constants';
import { useFormTransition } from '@/hooks/use-form-transition';

interface Props {
  communityId: string;
}

export function NewAnnouncementForm({ communityId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<string>('aviso');
  const [requiresAck, setRequiresAck] = useState(false);

  const { submit, error, pending } = useFormTransition(
    async (data: { title: string; body: string; type: string; requires_ack: boolean }) => {
      const result = await createAnnouncement(communityId, data);
      if (result.ok) router.push(`/c/${communityId}/comunicados/${result.id}`);
      return result;
    },
    { successMessage: 'Comunicado publicado' },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit({ title, body, type, requires_ack: requiresAck });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Asunto <span aria-hidden>*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Corte de agua el sábado"
          maxLength={160}
          required
          disabled={pending}
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">
          Tipo <span aria-hidden>*</span>
        </Label>
        <Select value={type} onValueChange={setType} disabled={pending}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANNOUNCEMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {ANNOUNCEMENT_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="body">
          Contenido <span aria-hidden>*</span>
        </Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe el comunicado completo aquí…"
          rows={6}
          maxLength={4000}
          required
          disabled={pending}
          className="resize-none"
        />
        <p className="text-right text-xs text-muted-foreground">{body.length}/4000</p>
      </div>

      {/* Requires ack */}
      <div className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          id="requires_ack"
          checked={requiresAck}
          onCheckedChange={(v) => setRequiresAck(Boolean(v))}
          disabled={pending}
          className="mt-0.5"
        />
        <div>
          <Label htmlFor="requires_ack" className="cursor-pointer font-medium">
            Requiere acuse de recibo
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Los vecinos deberán confirmar que han leído este comunicado.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => router.push(`/c/${communityId}/comunicados`)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          {pending ? 'Publicando…' : 'Publicar comunicado'}
        </Button>
      </div>
    </form>
  );
}
