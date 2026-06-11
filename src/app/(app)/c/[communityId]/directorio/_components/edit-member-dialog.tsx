'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateMember, type UpdateMemberInput } from '@/actions/directory';
import type { Role } from '@/lib/permissions';
import type { DirectoryEntry, UnitOption } from '../page';

interface Props {
  communityId: string;
  entry: DirectoryEntry;
  units: UnitOption[];
  viewerRole: Role;
  open: boolean;
  onClose: () => void;
}

export function EditMemberDialog({ communityId, entry, units, viewerRole: _viewerRole, open, onClose }: Props) {
  const [saving, setSaving] = useState(false);

  const isSuperadmin = entry.memberRole === 'superadmin';

  const sortedUnits = [...units].sort((a, b) => {
    const fa = parseInt(a.floor, 10);
    const fb = parseInt(b.floor, 10);
    return fa !== fb ? fa - fb : a.door.localeCompare(b.door);
  });

  const form = useForm<UpdateMemberInput>({
    defaultValues: {
      fullName: entry.fullName ?? '',
      phone: entry.phone ?? '',
      role: (['propietario', 'inquilino', 'junta', 'admin_finca'].includes(entry.memberRole ?? '')
        ? entry.memberRole
        : 'propietario') as UpdateMemberInput['role'],
      monthlyFee: entry.monthlyFee,
      paymentStatus: entry.paymentStatus,
      unitId: entry.unitId ?? null,
    },
  });

  async function onSubmit(data: UpdateMemberInput) {
    if (!entry.memberId) return;
    setSaving(true);
    const result = await updateMember(communityId, entry.memberId, entry.profileId!, data);
    setSaving(false);
    if (result.ok) {
      toast.success('Vecino actualizado correctamente');
      onClose();
    } else {
      toast.error(result.errors[0] ?? 'Error al guardar');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar vecino — {entry.floor}º{entry.door}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Vivienda */}
          <div className="space-y-1.5">
            <Label>Vivienda</Label>
            <Select
              value={form.watch('unitId') ?? '__none__'}
              onValueChange={(v) => form.setValue('unitId', v === '__none__' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin vivienda asignada" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="__none__">Sin vivienda asignada</SelectItem>
                {sortedUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.floor}º{u.door}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="em-name">Nombre completo</Label>
            <Input id="em-name" {...form.register('fullName', { required: true })} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="em-phone">Teléfono</Label>
            <Input id="em-phone" placeholder="+34 600 000 000" {...form.register('phone')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              {isSuperadmin ? (
                <div className="space-y-1">
                  <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground">
                    Superadministrador
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este rol no puede modificarse desde aquí.
                  </p>
                </div>
              ) : (
                <Select
                  value={form.watch('role')}
                  onValueChange={(v) => form.setValue('role', v as UpdateMemberInput['role'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="propietario">Propietario</SelectItem>
                    <SelectItem value="inquilino">Inquilino</SelectItem>
                    <SelectItem value="junta">Miembro de junta</SelectItem>
                    <SelectItem value="admin_finca">Administrador de finca</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="em-fee">Cuota (€/mes)</Label>
              <Input
                id="em-fee"
                type="number"
                min={0}
                step={0.01}
                {...form.register('monthlyFee', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Estado de pago</Label>
            <Select
              value={form.watch('paymentStatus')}
              onValueChange={(v) =>
                form.setValue('paymentStatus', v as UpdateMemberInput['paymentStatus'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="al_dia">Al día</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="moroso">Moroso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
