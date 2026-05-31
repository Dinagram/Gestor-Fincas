'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { createPoll } from '@/actions/polls';
import { Button } from '@/components/ui/button';
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
import { POLL_TYPE_LABEL, POLL_TYPES } from '@/lib/constants';
import { useFormTransition } from '@/hooks/use-form-transition';

interface Props {
  communityId: string;
}

export function NewPollForm({ communityId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('binary');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [quorumPercent, setQuorumPercent] = useState(50);
  const [amount, setAmount] = useState('');

  const { submit, error, pending } = useFormTransition(
    async (data: {
      title: string;
      description?: string;
      type: string;
      starts_at: string;
      ends_at: string;
      quorum_percent: number;
      amount?: number;
    }) => {
      const result = await createPoll(communityId, data);
      if (result.ok) router.push(`/c/${communityId}/votaciones/${result.id}`);
      return result;
    },
    { successMessage: 'Votación creada como borrador' },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit({
      title,
      description: description || undefined,
      type,
      starts_at: startsAt,
      ends_at: endsAt,
      quorum_percent: quorumPercent,
      amount: type === 'budget' && amount ? Number(amount) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span aria-hidden>*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Instalación de placas solares"
          maxLength={160}
          required
          disabled={pending}
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el motivo y alcance de esta votación…"
          rows={4}
          maxLength={2000}
          disabled={pending}
          className="resize-none"
        />
        <p className="text-right text-xs text-muted-foreground">{description.length}/2000</p>
      </div>

      {/* Tipo */}
      <div className="space-y-2">
        <Label htmlFor="type">
          Tipo <span aria-hidden>*</span>
        </Label>
        <Select value={type} onValueChange={setType} disabled={pending}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POLL_TYPES.filter((t) => t !== 'multiple').map((t) => (
              <SelectItem key={t} value={t}>
                {POLL_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Importe (condicional) */}
      {type === 'budget' && (
        <div className="space-y-2">
          <Label htmlFor="amount">
            Importe (€) <span aria-hidden>*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej: 18500"
            required
            disabled={pending}
          />
        </div>
      )}

      {/* Fechas */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="starts_at">
            Inicio <span aria-hidden>*</span>
          </Label>
          <Input
            id="starts_at"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ends_at">
            Fin <span aria-hidden>*</span>
          </Label>
          <Input
            id="ends_at"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            disabled={pending}
          />
        </div>
      </div>

      {/* Quórum */}
      <div className="space-y-2">
        <Label htmlFor="quorum">Quórum requerido (%)</Label>
        <div className="flex items-center gap-3">
          <Input
            id="quorum"
            type="number"
            min={1}
            max={100}
            value={quorumPercent}
            onChange={(e) => setQuorumPercent(Number(e.target.value))}
            className="w-24"
            disabled={pending}
          />
          <p className="text-sm text-muted-foreground">
            Se necesita al menos el {quorumPercent}% de participación para que la votación sea válida.
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
          onClick={() => router.push(`/c/${communityId}/votaciones`)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          {pending ? 'Creando…' : 'Crear votación'}
        </Button>
      </div>
    </form>
  );
}
