import { format, formatDistance } from 'date-fns';

export function formatDate(date: Date | string, formatStr = 'PP'): string {
  return format(new Date(date), formatStr);
}

export function timeAgo(date: Date | string): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
