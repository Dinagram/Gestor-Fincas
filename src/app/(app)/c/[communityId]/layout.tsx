import { notFound } from 'next/navigation';

import { AppSidebar } from '@/components/layouts/app-sidebar';
import { AppTopbar } from '@/components/layouts/app-topbar';
import { getMemberships, getProfile } from '@/lib/auth/get-user';
import { requireMember } from '@/lib/auth/require-user';
import { createServerClient } from '@/lib/supabase/server';
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
  const [{ data: community }, profile, memberships] = await Promise.all([
    supabase.from('communities').select('id, name').eq('id', communityId).maybeSingle(),
    getProfile(),
    getMemberships(),
  ]);

  if (!community) notFound();

  const options = memberships.map((m) => {
    const c = Array.isArray(m.communities) ? m.communities[0] : m.communities;
    return { id: m.community_id, name: c?.name ?? '—' };
  });

  return (
    <CommunityProvider value={{ communityId, communityName: community.name, role }}>
      <div className="flex h-svh w-full">
        <div className="hidden lg:block">
          <AppSidebar communityId={communityId} communityName={community.name} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar
            current={{ id: communityId, name: community.name }}
            options={options}
            user={{ fullName: profile?.full_name ?? null, email: user.email ?? '', role }}
          />
          <main className="flex-1 overflow-y-auto bg-muted/20">{children}</main>
        </div>
      </div>
    </CommunityProvider>
  );
}
