
import { AppSettings } from './types';

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Define se as inscrições estão abertas baseando-se estritamente
 * no controlo manual do administrador para a semana e ano correntes.
 */
export const areRegistrationsOpen = (settings: AppSettings | null): boolean => {
  if (!settings) return false;
  
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  // Conversão explícita para Number para evitar erros de comparação de tipos (string vs number)
  const openWeek = settings.manualOpenWeek ? Number(settings.manualOpenWeek) : null;
  const openYear = settings.manualOpenYear ? Number(settings.manualOpenYear) : null;

  return openWeek === currentWeek && openYear === currentYear;
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
