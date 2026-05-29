'use client';

import Link from 'next/link';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Community {
  id: string;
  name: string;
}

interface Props {
  current: Community;
  options: Community[];
}

export function CommunitySwitcher({ current, options }: Props) {
  if (options.length <= 1) {
    return (
      <div className="flex h-9 items-center rounded-md border border-transparent px-2 text-sm font-medium">
        {current.name}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 max-w-[220px] justify-between gap-2 px-2">
          <span className="truncate">{current.name}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Mis comunidades</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem key={opt.id} asChild>
            <Link href={`/c/${opt.id}/dashboard`} className="flex items-center justify-between">
              <span className="truncate">{opt.name}</span>
              {opt.id === current.id && <Check className="h-4 w-4 text-primary" />}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Plus className="h-4 w-4" />
          Añadir comunidad (pronto)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
