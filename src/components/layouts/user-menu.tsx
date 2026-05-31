'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ChevronUp, LogOut, Moon, Sun, User } from 'lucide-react';

import { AvatarGradient } from '@/components/shared/avatar-gradient';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROLE_LABEL } from '@/lib/constants';
import type { Role } from '@/lib/permissions';
import { createBrowserClient } from '@/lib/supabase/browser';

interface Props {
  fullName: string | null;
  email: string;
  role: Role;
  variant?: 'topbar' | 'sidebar';
}

export function UserMenu({ fullName, email, role, variant = 'topbar' }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  const trigger =
    variant === 'sidebar' ? (
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none transition-colors hover:bg-dd-beige/10 focus-visible:ring-2 focus-visible:ring-dd-beige/50">
        <AvatarGradient name={fullName ?? email} seed={email} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-dd-beige">{fullName ?? email}</p>
          <p className="truncate text-[11px] text-dd-beige/60">{ROLE_LABEL[role]}</p>
        </div>
        <ChevronUp className="h-4 w-4 shrink-0 text-dd-beige/60" />
      </DropdownMenuTrigger>
    ) : (
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <AvatarGradient name={fullName ?? email} seed={email} />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-none">{fullName ?? email}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
    );

  return (
    <DropdownMenu>
      {trigger}
      <DropdownMenuContent
        align={variant === 'sidebar' ? 'start' : 'end'}
        side={variant === 'sidebar' ? 'top' : 'bottom'}
        className="w-56"
      >
        <DropdownMenuLabel>
          <p className="text-sm font-medium leading-tight">{fullName ?? 'Sin nombre'}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="h-4 w-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
