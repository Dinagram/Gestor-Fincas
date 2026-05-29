'use client';

import { Search, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CommunitySwitcher } from '@/components/layouts/community-switcher';
import { UserMenu } from '@/components/layouts/user-menu';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import type { Role } from '@/lib/permissions';

interface Community {
  id: string;
  name: string;
}

interface Props {
  current: Community;
  options: Community[];
  user: { fullName: string | null; email: string; role: Role };
}

export function AppTopbar({ current, options, user }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile menu trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <AppSidebar communityId={current.id} communityName={current.name} />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">
        <CommunitySwitcher current={current} options={options} />
      </div>

      <div className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar incidencias, vecinos, documentos…"
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <UserMenu fullName={user.fullName} email={user.email} role={user.role} />
      </div>
    </header>
  );
}
