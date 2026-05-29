import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export function relativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function formatDate(date: string | Date, pattern = "d 'de' MMMM, yyyy"): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern, { locale: es });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "d 'de' MMM yyyy 'a las' HH:mm");
}
