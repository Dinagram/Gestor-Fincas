import type { Database } from '@/types/database';

export type Role = Database['public']['Tables']['community_members']['Row']['role'];

export type Action =
  | 'issue.create'
  | 'issue.comment'
  | 'issue.change_status'
  | 'issue.delete'
  | 'issue.support'
  | 'announcement.create'
  | 'announcement.delete'
  | 'poll.create'
  | 'poll.vote_economic'
  | 'member.invite'
  | 'community.edit';

const ROLE_RANK: Record<Role, number> = {
  inquilino: 1,
  propietario: 2,
  junta: 3,
  admin_finca: 4,
  superadmin: 5,
};

const POLICY: Record<Action, Role[]> = {
  'issue.create':         ['inquilino', 'propietario', 'junta', 'admin_finca'],
  'issue.comment':        ['inquilino', 'propietario', 'junta', 'admin_finca'],
  'issue.change_status':  ['junta', 'admin_finca'],
  'issue.delete':         ['admin_finca'],
  'issue.support':        ['inquilino', 'propietario', 'junta', 'admin_finca'],
  'announcement.create':  ['admin_finca'],
  'announcement.delete':  ['admin_finca'],
  'poll.create':          ['junta', 'admin_finca'],
  'poll.vote_economic':   ['propietario', 'junta', 'admin_finca'],
  'member.invite':        ['admin_finca'],
  'community.edit':       ['admin_finca'],
};

export function canDo(role: Role | null | undefined, action: Action): boolean {
  if (!role) return false;
  if (role === 'superadmin') return true;
  return POLICY[action].includes(role);
}

export function isAtLeast(role: Role | null | undefined, minimum: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
