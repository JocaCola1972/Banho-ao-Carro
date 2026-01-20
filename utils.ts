
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

  // Abertura apenas por controlo manual do administrador
  if (settings.manualOpenWeek === currentWeek && settings.manualOpenYear === currentYear) {
    return true;
  }

  return false;
};

export const getMonthYearString = (date: Date): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[date.getMonth()]} de ${date.getFullYear()}`;
};

export const formatPlate = (plate: string): string => {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
};
