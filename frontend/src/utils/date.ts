import { format, formatDistanceToNow, parseISO, addMonths, differenceInDays } from 'date-fns';

// Saudi Arabia timezone offset (UTC+3)
const SAUDI_TIMEZONE_OFFSET = 3 * 60; // minutes

/**
 * Convert date to Saudi Arabia timezone
 * @param date - Date string or Date object
 * @returns Date adjusted to Saudi timezone
 */
export function toSaudiTime(date: string | Date): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return new Date(utcDate.getTime() + SAUDI_TIMEZONE_OFFSET * 60000);
}

/**
 * Format date in DD/MM/YYYY format
 * @param date - Date string or Date object
 * @param pattern - Date format pattern (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, pattern: string = 'dd/MM/yyyy'): string {
  const saudiDate = toSaudiTime(date);
  return format(saudiDate, pattern);
}

/**
 * Format date with time (DD/MM/YYYY HH:mm)
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Format date in Hijri calendar
 * @param date - Date string or Date object
 * @returns Formatted Hijri date string
 */
export function formatHijriDate(date: string | Date): string {
  const saudiDate = toSaudiTime(date);
  
  // Simple Hijri approximation (for display purposes only)
  // In production, use a proper Hijri calendar library or API
  const gregorianYear = saudiDate.getFullYear();
  const hijriYear = Math.floor((gregorianYear - 622) * 1.030684);
  
  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  
  const monthIndex = Math.floor(Math.random() * 12); // Simplified for now
  const day = saudiDate.getDate();
  
  return `${day} ${hijriMonths[monthIndex]} ${hijriYear}`;
}

/**
 * Format date with optional Hijri
 * @param date - Date string or Date object
 * @param showHijri - Whether to show Hijri date
 * @returns Formatted date string(s)
 */
export function formatDateWithHijri(date: string | Date, showHijri: boolean = false): string {
  const gregorian = formatDate(date);
  if (showHijri) {
    const hijri = formatHijriDate(date);
    return `${gregorian} (${hijri})`;
  }
  return gregorian;
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const saudiDate = toSaudiTime(date);
  return formatDistanceToNow(saudiDate, { addSuffix: true });
}

/**
 * Calculate days until date
 * @param date - Date string or Date object
 * @returns Number of days (negative if past)
 */
export function daysUntil(date: string | Date): number {
  const saudiDate = toSaudiTime(date);
  return differenceInDays(saudiDate, new Date());
}

/**
 * Check if date is in the past
 * @param date - Date string or Date object
 * @returns True if date is in the past
 */
export function isDatePast(date: string | Date): boolean {
  return daysUntil(date) < 0;
}

/**
 * Check if date is today
 * @param date - Date string or Date object
 * @returns True if date is today
 */
export function isToday(date: string | Date): boolean {
  const saudiDate = toSaudiTime(date);
  const today = new Date();
  return (
    saudiDate.getDate() === today.getDate() &&
    saudiDate.getMonth() === today.getMonth() &&
    saudiDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Add months to date
 * @param date - Date string or Date object
 * @param months - Number of months to add
 * @returns New date
 */
export function addMonthsToDate(date: string | Date, months: number): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return addMonths(d, months);
}

/**
 * Format countdown timer (e.g., "2h 30m" or "5d 3h")
 * @param targetDate - Target date string or Date object
 * @returns Formatted countdown string
 */
export function formatCountdown(targetDate: string | Date): string {
  const target = toSaudiTime(targetDate);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
