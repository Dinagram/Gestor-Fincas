'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, FileText, FolderArchive, Gauge, LayoutDashboard, Megaphone, Settings, Users, Vote, Wrench } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Props {
  communityId: string;
  communityName: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
}

export function AppSidebar({ communityId, communityName }: Props) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { label: 'Dashboard',     href: `/c/${communityId}/dashboard`,     icon: LayoutDashboard },
    { label: 'Incidencias',   href: `/c/${communityId}/incidencias`,   icon: Wrench },
    { label: 'Votaciones',    href: `/c/${communityId}/votaciones`,    icon: Vote },
    { label: 'Comunicados',   href: `/c/${communityId}/comunicados`,   icon: Megaphone },
    { label: 'Directorio',    href: `/c/${communityId}/directorio`,    icon: Users },
    { label: 'Presupuesto',   href: `/c/${communityId}/presupuesto`,   icon: Gauge },
    { label: 'Documentos',    href: `/c/${communityId}/documentos`,    icon: FolderArchive },
    { label: 'Configuración', href: `/c/${communityId}/ajustes`,       icon: Settings },
  ];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{communityName}</p>
          <p className="truncate text-xs text-muted-foreground">GestiónFinca</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3 text-xs text-muted-foreground">
        <p>v0.1 · MVP</p>
      </div>
    </aside>
  );
}
