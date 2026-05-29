'use client';

import { useRole } from '@/providers/community-provider';
import type { Action, Role } from '@/lib/permissions';
import { canDo } from '@/lib/permissions';

interface Props {
  children: React.ReactNode;
  allow?: Role[];
  action?: Action;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if the current user's role satisfies either
 * `allow` (whitelist of roles) or `action` (permission check).
 *
 * This is a UI affordance — never the only line of defense. RLS + Server
 * Action checks are the source of truth.
 */
export function RoleGate({ children, allow, action, fallback = null }: Props) {
  const role = useRole();

  if (allow && (allow.includes(role) || role === 'superadmin')) return <>{children}</>;
  if (action && canDo(role, action)) return <>{children}</>;
  if (!allow && !action) return <>{children}</>;

  return <>{fallback}</>;
}
