import { notFound } from 'next/navigation';

import { LogoSplash } from '@/components/shared/logo-splash';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { AppTopbar } from '@/components/layouts/app-topbar';
import { getMemberships, getProfile } from '@/lib/auth/get-user';
import { requireMember } from '@/lib/auth/require-user';
import { createServerClient } from '@/lib/supabase/server';
import { getActivePollCount, getOpenIssueCount } from '@/lib/data/community-queries';
import { CommunityProvider } from '@/providers/community-provider';

type Params = Promise<{ communityId: string }>;

export default async function CommunityLayout({
  params,
  children,
}: {
  params: Params;
  children: React.ReactNode;
}) {
  const { communityId } = await params;
  const { user, role } = await requireMember(communityId);

  const supabase = await createServerClient();
  const [{ data: community }, profile, memberships, units, openIssuesCount, activePollsCount, allAnnouncements, myReads] =
    await Promise.all([
      supabase
        .from('communities')
        .select('id, name, address, city, postal_code')
        .eq('id', communityId)
        .maybeSingle(),
      getProfile(),
      getMemberships(),
      supabase.from('units').select('floor, type').eq('community_id', communityId).eq('type', 'vivienda'),
      // Cacheado: dashboard/page.tsx reutiliza este resultado sin re-llamar a la BD
      getOpenIssueCount(communityId),
      getActivePollCount(communityId),
      // All announcement IDs for this community
      supabase
        .from('announcements')
        .select('id')
        .eq('community_id', communityId),
      // IDs this user has already read
      supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('community_id', communityId)
        .eq('profile_id', user.id),
    ]);

  if (!community) notFound();

  const viviendas = units.data ?? [];
  const plantas = new Set(viviendas.map((u) => u.floor)).size;

  const readIds = new Set((myReads.data ?? []).map((r) => r.announcement_id));
  const unreadAnnouncements = (allAnnouncements.data ?? []).filter(
    (a) => !readIds.has(a.id),
  ).length;

  const options = memberships.map((m) => {
    const c = Array.isArray(m.communities) ? m.communities[0] : m.communities;
    return { id: m.community_id, name: c?.name ?? '—' };
  });

  const sidebar = (
    <AppSidebar
      communityId={communityId}
      community={{
        id: community.id,
        name: community.name,
        address: community.address,
        city: community.city,
        postalCode: community.postal_code,
        viviendas: viviendas.length,
        plantas,
      }}
      options={options}
      user={{ fullName: profile?.full_name ?? null, email: user.email ?? '', role }}
      counts={{ openIssues: openIssuesCount, activePolls: activePollsCount, unreadAnnouncements }}
    />
  );

  return (
    <CommunityProvider value={{ communityId, communityName: community.name, role }}>
      <LogoSplash />
      <div className="flex h-svh w-full">
        <div className="hidden lg:block">{sidebar}</div>
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar communityName={community.name} sidebar={sidebar} unread={unreadAnnouncements} />
          <main className="flex-1 overflow-y-auto bg-muted/20">{children}</main>
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-3 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} GestiónFinca · Portal Vecinal</span>
            <span>
              Powered by <span className="font-medium text-foreground">Shire</span>
            </span>
          </footer>
        </div>
      </div>
    </CommunityProvider>
  );
}
