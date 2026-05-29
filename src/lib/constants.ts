import type { Database } from '@/types/database';

type IssueStatus = Database['public']['Tables']['issues']['Row']['status'];
type IssuePriority = Database['public']['Tables']['issues']['Row']['priority'];
type IssueCategory = Database['public']['Tables']['issues']['Row']['category'];
type MemberRole = Database['public']['Tables']['community_members']['Row']['role'];

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  abierta: 'Abierta',
  en_revision: 'En revisión',
  en_curso: 'En curso',
  resuelta: 'Resuelta',
  cerrada: 'Cerrada',
  descartada: 'Descartada',
};

export const ISSUE_STATUS_ORDER: IssueStatus[] = [
  'abierta',
  'en_revision',
  'en_curso',
  'resuelta',
  'cerrada',
  'descartada',
];

export const ISSUE_PRIORITY_LABEL: Record<IssuePriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const ISSUE_CATEGORY_LABEL: Record<IssueCategory, string> = {
  ascensor: 'Ascensor',
  fontaneria: 'Fontanería',
  electricidad: 'Electricidad',
  limpieza: 'Limpieza',
  ruido: 'Ruido',
  seguridad: 'Seguridad',
  jardineria: 'Jardinería',
  obras: 'Obras',
  otros: 'Otros',
};

export const ROLE_LABEL: Record<MemberRole, string> = {
  superadmin: 'Superadmin',
  admin_finca: 'Administrador',
  junta: 'Miembro de junta',
  propietario: 'Propietario',
  inquilino: 'Inquilino',
};

export const ISSUE_STATUSES = Object.keys(ISSUE_STATUS_LABEL) as IssueStatus[];
export const ISSUE_PRIORITIES = Object.keys(ISSUE_PRIORITY_LABEL) as IssuePriority[];
export const ISSUE_CATEGORIES = Object.keys(ISSUE_CATEGORY_LABEL) as IssueCategory[];
