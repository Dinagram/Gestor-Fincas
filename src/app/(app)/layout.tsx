import { requireUser } from '@/lib/auth/require-user';

/**
 * The (app) group only enforces that there's an authenticated user.
 * Per-community gating happens in /c/[communityId]/layout.tsx.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
