
import { AppSettings } from './types';

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const areRegistrationsOpen = (settings: AppSettings): boolean => {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  // Check manual override
  if (settings.manualOpenWeek === currentWeek && settings.manualOpenYear === currentYear) {
    return true;
  }

  // Automatic: Thursdays at 08:00
  const day = now.getDay(); // 0 (Sun) to 6 (Sat)
  const hour = now.getHours();

  // If it's Thursday (4), and hour >= 8
  if (day === 4 && hour >= 8) return true;
  // If it's Friday, Saturday
  if (day > 4) return true;
  // If it's Sunday, Monday, Tuesday, Wednesday -> Closed (unless manual)
  return false;
};

export const getMonthYearString = (date: Date): string => {
  return `${date.getMonth() + 1}-${date.getFullYear()}`;
};

export const formatPlate = (plate: string): string => {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
};
