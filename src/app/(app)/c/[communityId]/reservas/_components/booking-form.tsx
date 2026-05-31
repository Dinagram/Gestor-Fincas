'use client';

import { useMemo, useReducer, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { createBooking } from '@/actions/bookings';
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
import { BOOKING_CATEGORIES, BOOKING_CATEGORY_LABEL } from '@/lib/constants';

import { RulesChecklist } from './rules-checklist';
import { hourLabel, isHourBusy, localDateKey } from '../_lib/calendar';
import type { BookingView, RoomRulesView, RoomView } from '../_lib/types';

interface Props {
  communityId: string;
  room: RoomView;
  rules: RoomRulesView;
  bookings: BookingView[];
  initialDate?: string;
  initialStartHour?: number;
  /** Si se pasa, se invoca tras crear (p.ej. para cerrar el diálogo). */
  onCreated?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Estado del formulario
// ---------------------------------------------------------------------------

type FormState = {
  date: string;
  startHour: number;
  endHour: number;
  purpose: string;
  category: string;
  attendees: string;
  accepted: boolean;
  error: string | undefined;
  alternatives: string[];
};

type FormAction =
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_START'; hour: number }
  | { type: 'SET_END'; hour: number }
  | { type: 'SET_PURPOSE'; value: string }
  | { type: 'SET_CATEGORY'; value: string }
  | { type: 'SET_ATTENDEES'; value: string }
  | { type: 'SET_ACCEPTED'; value: boolean }
  | { type: 'SET_ERROR'; error: string; alternatives: string[] }
  | { type: 'APPLY_ALTERNATIVE'; slot: string }
  | { type: 'CLEAR_ERROR' };

function buildInitialState(
  openHour: number,
  initialDate?: string,
  initialStartHour?: number,
): FormState {
  const startHour = initialStartHour ?? openHour;
  return {
    date: initialDate ?? '',
    startHour,
    endHour: startHour + 1,
    purpose: '',
    category: 'reunion',
    attendees: '',
    accepted: false,
    error: undefined,
    alternatives: [],
  };
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, date: action.date, error: undefined, alternatives: [] };
    case 'SET_START':
      return { ...state, startHour: action.hour, endHour: action.hour + 1, error: undefined, alternatives: [] };
    case 'SET_END':
      return { ...state, endHour: action.hour };
    case 'SET_PURPOSE':
      return { ...state, purpose: action.value };
    case 'SET_CATEGORY':
      return { ...state, category: action.value };
    case 'SET_ATTENDEES':
      return { ...state, attendees: action.value };
    case 'SET_ACCEPTED':
      return { ...state, accepted: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.error, alternatives: action.alternatives };
    case 'APPLY_ALTERNATIVE': {
      const [a, b] = action.slot.split('–');
      const sh = parseInt(a!, 10);
      const eh = parseInt(b!, 10);
      return {
        ...state,
        startHour: Number.isNaN(sh) ? state.startHour : sh,
        endHour: Number.isNaN(eh) ? state.endHour : eh,
        error: undefined,
        alternatives: [],
      };
    }
    case 'CLEAR_ERROR':
      return { ...state, error: undefined, alternatives: [] };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function BookingForm({
  communityId,
  room,
  rules,
  bookings,
  initialDate,
  initialStartHour,
  onCreated,
}: Props) {
  const router = useRouter();
  const todayKey = localDateKey(new Date());
  const [pending, startTransition] = useTransition();
  const [form, dispatch] = useReducer(
    formReducer,
    buildInitialState(room.openHour, initialDate, initialStartHour),
  );

  const { date, startHour, endHour, purpose, category, attendees, accepted, error, alternatives } =
    form;

  const startOptions = useMemo(() => {
    const out: { h: number; busy: boolean }[] = [];
    for (let h = room.openHour; h < room.closeHour; h++) {
      out.push({ h, busy: date ? isHourBusy(bookings, date, h) : false });
    }
    return out;
  }, [bookings, date, room.openHour, room.closeHour]);

  const endOptions = useMemo(() => {
    const out: number[] = [];
    for (let e = startHour + 1; e <= room.closeHour; e++) {
      if (e - startHour > rules.maxDurationHours) break;
      if (date && isHourBusy(bookings, date, e - 1)) break;
      out.push(e);
    }
    return out;
  }, [startHour, room.closeHour, rules.maxDurationHours, bookings, date]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: 'CLEAR_ERROR' });
    startTransition(async () => {
      const result = await createBooking(communityId, {
        date,
        startHour,
        endHour,
        purpose,
        category,
        attendees: attendees ? Number(attendees) : undefined,
        rulesAccepted: accepted,
      });
      if (!result.ok) {
        dispatch({
          type: 'SET_ERROR',
          error: result.error,
          alternatives: result.alternatives ?? [],
        });
        toast.error(result.error);
        return;
      }
      toast.success(
        result.status === 'pendiente'
          ? 'Reserva enviada — pendiente de aprobación'
          : 'Reserva confirmada',
      );
      if (onCreated) onCreated(result.id);
      else router.push(`/c/${communityId}/reservas/${result.id}`);
      router.refresh();
    });
  }

  const durationOk = endHour > startHour;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Fecha */}
      <div className="space-y-2">
        <Label htmlFor="date">
          Fecha <span aria-hidden>*</span>
        </Label>
        <Input
          id="date"
          type="date"
          required
          min={todayKey}
          value={date}
          onChange={(e) => dispatch({ type: 'SET_DATE', date: e.target.value })}
          disabled={pending}
        />
      </div>

      {/* Horas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startHour">
            Desde <span aria-hidden>*</span>
          </Label>
          <Select
            value={String(startHour)}
            onValueChange={(v) => dispatch({ type: 'SET_START', hour: Number(v) })}
            disabled={pending}
          >
            <SelectTrigger id="startHour">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {startOptions.map(({ h, busy }) => (
                <SelectItem key={h} value={String(h)} disabled={busy}>
                  {hourLabel(h)}
                  {busy ? ' · ocupado' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endHour">
            Hasta <span aria-hidden>*</span>
          </Label>
          <Select
            value={String(endHour)}
            onValueChange={(v) => dispatch({ type: 'SET_END', hour: Number(v) })}
            disabled={pending}
          >
            <SelectTrigger id="endHour">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {endOptions.map((h) => (
                <SelectItem key={h} value={String(h)}>
                  {hourLabel(h)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Horario {hourLabel(room.openHour)}–{hourLabel(room.closeHour)} · máx.{' '}
        {rules.maxDurationHours} h · mínimo {rules.minAdvanceHours} h de antelación
      </p>

      {/* Motivo */}
      <div className="space-y-2">
        <Label htmlFor="purpose">
          Motivo de uso <span aria-hidden>*</span>
        </Label>
        <Input
          id="purpose"
          required
          maxLength={160}
          value={purpose}
          onChange={(e) => dispatch({ type: 'SET_PURPOSE', value: e.target.value })}
          placeholder="Ej: Reunión de vecinos, cumpleaños infantil…"
          disabled={pending}
        />
      </div>

      {/* Categoría + asistentes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Tipo de actividad</Label>
          <Select
            value={category}
            onValueChange={(v) => dispatch({ type: 'SET_CATEGORY', value: v })}
            disabled={pending}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOKING_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {BOOKING_CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="attendees">
            Asistentes <span aria-hidden>*</span>
          </Label>
          <Input
            id="attendees"
            type="number"
            min={1}
            max={rules.maxAttendees ?? 500}
            required
            value={attendees}
            onChange={(e) => dispatch({ type: 'SET_ATTENDEES', value: e.target.value })}
            placeholder={rules.maxAttendees ? `Máx. ${rules.maxAttendees}` : 'Nº personas'}
            disabled={pending}
          />
        </div>
      </div>

      {/* Normas + aceptación */}
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Normas de uso de la sala
        </p>
        <RulesChecklist />
        <label className="flex cursor-pointer items-start gap-3 border-t pt-3">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => dispatch({ type: 'SET_ACCEPTED', value: Boolean(v) })}
            disabled={pending}
            className="mt-0.5"
          />
          <span className="text-sm font-medium">He leído y acepto las normas de uso</span>
        </label>
      </div>

      {/* Error + alternativas */}
      {error && (
        <div
          role="alert"
          className="space-y-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <p>{error}</p>
          {alternatives.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {alternatives.slice(0, 8).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => dispatch({ type: 'APPLY_ALTERNATIVE', slot })}
                  className="inline-flex items-center gap-1 rounded-full border border-dd-terracota/40 bg-background px-2 py-0.5 text-xs font-medium text-dd-terracota transition-colors hover:bg-dd-terracota/10"
                >
                  <CalendarClock className="h-3 w-3" />
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-1">
        <Button type="submit" disabled={pending || !accepted || !durationOk || !date}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          {pending ? 'Reservando…' : 'Confirmar reserva'}
        </Button>
      </div>
    </form>
  );
}
