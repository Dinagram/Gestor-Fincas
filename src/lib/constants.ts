import type { Database } from '@/types/database';

type IssueStatus = Database['public']['Tables']['issues']['Row']['status'];
type IssuePriority = Database['public']['Tables']['issues']['Row']['priority'];
type IssueCategory = Database['public']['Tables']['issues']['Row']['category'];
type MemberRole = Database['public']['Tables']['community_members']['Row']['role'];
type AnnouncementType = Database['public']['Enums']['announcement_type'];

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

export const ANNOUNCEMENT_TYPE_LABEL: Record<AnnouncementType, string> = {
  aviso: 'Aviso',
  convocatoria: 'Convocatoria',
  resolucion: 'Resolución',
  urgente: 'Urgente',
};

export const ANNOUNCEMENT_TYPES = Object.keys(
  ANNOUNCEMENT_TYPE_LABEL,
) as AnnouncementType[];

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

type PollStatus = Database['public']['Enums']['poll_status'];
type PollType = Database['public']['Enums']['poll_type'];

export const POLL_STATUS_LABEL: Record<PollStatus, string> = {
  draft: 'Borrador',
  active: 'Activa',
  closed: 'Cerrada',
  cancelled: 'Cancelada',
};

export const POLL_TYPE_LABEL: Record<PollType, string> = {
  binary: 'Binaria',
  multiple: 'Múltiple',
  budget: 'Presupuesto',
};

export const POLL_STATUSES = Object.keys(POLL_STATUS_LABEL) as PollStatus[];
export const POLL_TYPES = Object.keys(POLL_TYPE_LABEL) as PollType[];

/** Clases Tailwind para el badge de estado de una votación (inline, sin CVA). */
export const POLL_STATUS_BADGE_CLASSES: Record<PollStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  closed: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

// =====================================================================
// Sala Multiusos / Reservas
// =====================================================================
type BookingStatus = Database['public']['Enums']['booking_status'];
type BookingCategory = Database['public']['Enums']['booking_category'];
type BookingKind = Database['public']['Enums']['booking_kind'];

// Tonos alineados con los del status-pill (slate/zinc/blue/amber/green/red)
export type PillTone = 'slate' | 'zinc' | 'blue' | 'amber' | 'green' | 'red';

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

export const BOOKING_STATUS_TONE: Record<BookingStatus, PillTone> = {
  pendiente: 'amber',
  confirmada: 'green',
  cancelada: 'zinc',
  completada: 'blue',
};

export const BOOKING_CATEGORY_LABEL: Record<BookingCategory, string> = {
  reunion: 'Reunión',
  cumpleanos: 'Cumpleaños',
  deporte: 'Actividad deportiva',
  taller: 'Taller',
  otro: 'Otro',
};

export const BOOKING_KIND_LABEL: Record<BookingKind, string> = {
  vecino: 'Reserva vecinal',
  comunidad: 'Evento comunitario',
  bloqueo: 'Bloqueo',
};

export const BOOKING_STATUSES = Object.keys(BOOKING_STATUS_LABEL) as BookingStatus[];
export const BOOKING_CATEGORIES = Object.keys(BOOKING_CATEGORY_LABEL) as BookingCategory[];

// Reglas de la sala (también viven en room_booking_rules.rules_text en BD;
// aquí para mostrarlas en el resumen previo a confirmar).
export const ROOM_RULES: string[] = [
  'Acceso exclusivo a residentes de la comunidad.',
  'Los invitados deben ir siempre acompañados de un residente.',
  'Es obligatorio dejar la sala limpia y recogida tras su uso.',
  'El solicitante es responsable de los daños que se ocasionen.',
  'Debe respetarse el horario de descanso del vecindario.',
  'No se permite el acceso de mascotas a la sala.',
];

// Configuración por defecto de la Sala Multiusos (refleja room_booking_rules).
export const ROOM_OPEN_HOUR = 9;
export const ROOM_CLOSE_HOUR = 22;
export const ROOM_MAX_PER_MONTH = 2;
export const ROOM_MIN_ADVANCE_HOURS = 48;
export const ROOM_MAX_DURATION_HOURS = 4;
