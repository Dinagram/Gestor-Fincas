'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PowerOff, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { setRequiresApproval, setRoomOutOfService } from '@/actions/bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { RoomStatus } from '../../_lib/types';

interface Props {
  communityId: string;
  roomId: string;
  status: RoomStatus;
  requiresApproval: boolean;
}

export function RoomControls({ communityId, roomId, status, requiresApproval }: Props) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();
  const outOfService = status === 'fuera_servicio';

  function toggleService() {
    startTransition(async () => {
      const result = await setRoomOutOfService(communityId, {
        roomId,
        outOfService: !outOfService,
        reason: !outOfService ? reason || undefined : undefined,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(!outOfService ? 'Sala marcada fuera de servicio' : 'Sala reactivada');
      router.refresh();
    });
  }

  function toggleApproval() {
    startTransition(async () => {
      const result = await setRequiresApproval(communityId, roomId, !requiresApproval);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        !requiresApproval
          ? 'Las reservas requerirán aprobación'
          : 'Confirmación instantánea activada',
      );
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Configuración de la sala</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Estado */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Estado de la sala</p>
              <p className={cn('text-xs', outOfService ? 'text-dd-taupe' : 'text-emerald-600')}>
                {outOfService ? 'Fuera de servicio' : 'Disponible para reservas'}
              </p>
            </div>
            <Button
              variant={outOfService ? 'default' : 'outline'}
              size="sm"
              onClick={toggleService}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : outOfService ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <PowerOff className="h-4 w-4" />
              )}
              {outOfService ? 'Reactivar' : 'Fuera de servicio'}
            </Button>
          </div>
          {!outOfService && (
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo (opcional): obras, limpieza profunda…"
              maxLength={200}
              disabled={pending}
              className="h-8 text-xs"
            />
          )}
        </div>

        {/* Modo de aprobación */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-sm font-medium">Modo de reserva</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {requiresApproval ? (
                <>
                  <ShieldCheck className="h-3 w-3" /> Requiere aprobación
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3" /> Confirmación instantánea
                </>
              )}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={toggleApproval} disabled={pending}>
            {requiresApproval ? 'Pasar a instantánea' : 'Exigir aprobación'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
