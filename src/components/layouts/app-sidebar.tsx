'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Check,
  ChevronsUpDown,
  FolderOpen,
  Home,
  LayoutDashboard,
  Megaphone,
  PiggyBank,
  Plus,
  Settings,
  UserCheck,
  Users,
  Vote,
} from 'lucide-react';

import { UserMenu } from '@/components/layouts/user-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { isAtLeast, type Role } from '@/lib/permissions';

interface Community {
  id: string;
  name: string;
}

export interface SidebarCommunity extends Community {
  address: string | null;
  city: string | null;
  postalCode: string | null;
  viviendas: number;
  plantas: number;
}

interface Props {
  communityId: string;
  community: SidebarCommunity;
  options: Community[];
  user: { fullName: string | null; email: string; role: Role };
  counts: { openIssues: number; activePolls: number; unreadAnnouncements: number };
}

type BadgeTone = 'brand' | 'emerald';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  count?: number;
  tone?: BadgeTone;
}

const BADGE_TONES: Record<BadgeTone, string> = {
  brand: 'bg-dd-beige/15 text-dd-beige',
  emerald: 'bg-dd-beige/15 text-dd-beige',
};

export function AppSidebar({ communityId, community, options, user, counts }: Props) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { label: 'Dashboard', href: `/c/${communityId}/dashboard`, icon: LayoutDashboard },
    { label: 'Incidencias', href: `/c/${communityId}/incidencias`, icon: AlertCircle, count: counts.openIssues, tone: 'brand' },
    { label: 'Votaciones', href: `/c/${communityId}/votaciones`, icon: Vote, count: counts.activePolls, tone: 'emerald' },
    { label: 'Comunicados', href: `/c/${communityId}/comunicados`, icon: Megaphone, count: counts.unreadAnnouncements, tone: 'brand' },
    { label: 'Sala Multiusos', href: `/c/${communityId}/reservas`, icon: CalendarDays },
    { label: 'Directorio', href: `/c/${communityId}/directorio`, icon: Users },
    ...(isAtLeast(user.role, 'junta')
      ? [{ label: 'Presupuesto', href: `/c/${communityId}/presupuesto`, icon: PiggyBank } as NavItem]
      : []),
    { label: 'Documentos', href: `/c/${communityId}/documentos`, icon: FolderOpen },
    ...(isAtLeast(user.role, 'admin_finca')
      ? [{ label: 'Usuarios', href: `/c/${communityId}/usuarios`, icon: UserCheck } as NavItem]
      : []),
    { label: 'Configuración', href: `/c/${communityId}/ajustes`, icon: Settings },
  ];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-dd-bronce text-dd-beige">
      {/* Brand + community */}
      <div className="flex h-16 items-center gap-3 border-b border-dd-beige/15 px-4">
        <Image
          src="/assets/brand/logo_negativo.png"
          alt="Dr. Domagk 2"
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full"
          priority
        />
        {options.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex min-w-0 flex-1 items-center gap-1 rounded-md py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-dd-beige/50">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold leading-tight text-dd-beige">
                  {community.name}
                </span>
                <span className="block truncate text-[11px] text-dd-beige/60">Cambiar comunidad</span>
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-dd-beige/60 group-hover:text-dd-beige" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel>Mis comunidades</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {options.map((opt) => (
                <DropdownMenuItem key={opt.id} asChild>
                  <Link href={`/c/${opt.id}/dashboard`} className="flex items-center justify-between">
                    <span className="truncate">{opt.name}</span>
                    {opt.id === communityId && <Check className="h-4 w-4 text-primary" />}
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
        ) : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-dd-beige">{community.name}</p>
            <p className="truncate text-[11px] text-dd-beige/60">Portal Vecinal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navegación principal">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'sidebar-item-active text-dd-beige'
                  : 'text-dd-beige/65 hover:bg-dd-beige/10 hover:text-dd-beige',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.count !== undefined && item.count > 0 && item.tone && (
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                    BADGE_TONES[item.tone],
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Community info card */}
      <div className="mx-3 mb-3 rounded-lg border border-dd-beige/15 bg-dd-beige/5 p-3">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-dd-beige/50">
          Comunidad
        </p>
        <p className="truncate text-xs font-semibold text-dd-beige">{community.name}</p>
        {(community.address || community.city) && (
          <p className="mt-0.5 text-[11px] leading-snug text-dd-beige/65">
            {[community.address, [community.postalCode, community.city].filter(Boolean).join(' ')]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
        <div className="mt-2.5 flex items-center gap-3 border-t border-dd-beige/15 pt-2.5 text-[11px] text-dd-beige/65">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {community.plantas} {community.plantas === 1 ? 'planta' : 'plantas'}
          </span>
          <span className="flex items-center gap-1">
            <Home className="h-3 w-3" />
            {community.viviendas} viviendas
          </span>
        </div>
      </div>

      {/* User */}
      <div className="border-t border-dd-beige/15 p-3">
        <UserMenu
          variant="sidebar"
          fullName={user.fullName}
          email={user.email}
          role={user.role}
          communityId={communityId}
        />
      </div>
    </aside>
  );
}
