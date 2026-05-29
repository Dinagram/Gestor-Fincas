'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ISSUE_CATEGORIES,
  ISSUE_CATEGORY_LABEL,
  ISSUE_PRIORITIES,
  ISSUE_PRIORITY_LABEL,
  ISSUE_STATUSES,
  ISSUE_STATUS_LABEL,
} from '@/lib/constants';

const ALL = '__all__';

export function IssueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== ALL && value !== '') next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const estado = params.get('estado') ?? ALL;
  const categoria = params.get('categoria') ?? ALL;
  const prioridad = params.get('prioridad') ?? ALL;
  const q = params.get('q') ?? '';

  const hasFilters = estado !== ALL || categoria !== ALL || prioridad !== ALL || q !== '';

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título…"
          className="pl-9"
          defaultValue={q}
          onChange={(e) => updateParam('q', e.target.value)}
        />
      </div>

      <Select value={estado} onValueChange={(v) => updateParam('estado', v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos los estados</SelectItem>
          {ISSUE_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {ISSUE_STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoria} onValueChange={(v) => updateParam('categoria', v)}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas las categorías</SelectItem>
          {ISSUE_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {ISSUE_CATEGORY_LABEL[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={prioridad} onValueChange={(v) => updateParam('prioridad', v)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Cualquier prioridad</SelectItem>
          {ISSUE_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {ISSUE_PRIORITY_LABEL[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={() => router.replace(pathname)}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
