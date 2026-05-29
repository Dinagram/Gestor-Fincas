import { redirect } from 'next/navigation';

import { getMemberships, getUser } from '@/lib/auth/get-user';

export default async function RootPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const memberships = await getMemberships();
  if (memberships.length === 0) redirect('/onboarding');

  const first = memberships[0]!;
  redirect(`/c/${first.community_id}/dashboard`);
}
