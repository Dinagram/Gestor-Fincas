'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCommunity } from '@/actions/community';
import { updateCommunitySchema, type UpdateCommunityInput } from '@/lib/validators/community';

interface Props {
  communityId: string;
  defaultValues: UpdateCommunityInput;
  canEdit: boolean;
}

export function CommunitySettingsForm({ communityId, defaultValues, canEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<UpdateCommunityInput>({
    resolver: zodResolver(updateCommunitySchema),
    defaultValues,
  });

  async function onSubmit(data: UpdateCommunityInput) {
    setSaving(true);
    const result = await updateCommunity(communityId, data);
    setSaving(false);
    if (result.ok) {
      toast.success('Cambios guardados correctamente');
      setEditing(false);
    } else {
      toast.error(result.error);
    }
  }

  function handleCancel() {
    form.reset(defaultValues);
    setEditing(false);
  }

  // Modo solo lectura
  if (!editing) {
    return (
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <ReadField label="Nombre de la comunidad" value={form.getValues('name')} />
          <ReadField label="CIF / NIF" value={form.getValues('cif')} />
          <ReadField label="Dirección" value={form.getValues('address')} className="sm:col-span-2" />
          <ReadField label="Ciudad" value={form.getValues('city')} />
          <ReadField label="Provincia" value={form.getValues('province')} />
          <ReadField label="Código postal" value={form.getValues('postal_code')} />
        </div>
        {canEdit && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Modo edición
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre de la comunidad</Label>
          <Input id="name" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cif">CIF / NIF</Label>
          <Input id="cif" placeholder="H12345678" {...form.register('cif')} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" {...form.register('address')} />
          {form.formState.errors.address && (
            <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" {...form.register('city')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="province">Provincia</Label>
          <Input id="province" {...form.register('province')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="postal_code">Código postal</Label>
          <Input id="postal_code" maxLength={5} {...form.register('postal_code')} />
          {form.formState.errors.postal_code && (
            <p className="text-xs text-destructive">{form.formState.errors.postal_code.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

function ReadField({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value || <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}
