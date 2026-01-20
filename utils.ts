
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

  // 1. Override Manual: Se o administrador FECHOU explicitamente para esta semana
  if (settings.manualCloseWeek === currentWeek && settings.manualCloseYear === currentYear) {
    return false;
  }

  // 2. Override Manual: Se o administrador ABRIU explicitamente para esta semana (ou antes do tempo)
  if (settings.manualOpenWeek === currentWeek && settings.manualOpenYear === currentYear) {
    return true;
  }

  // 3. Lógica Automática: Quintas-feiras às 8:00 da manhã
  const day = now.getDay(); // 0 = Domingo, 1 = Segunda... 4 = Quinta, 5 = Sexta, 6 = Sábado
  const hour = now.getHours();

  // Se for Quinta (4) após as 08:00, ou Sexta (5), ou Sábado (6)
  if (day > 4 || (day === 4 && hour >= 8)) {
    return true;
  }

  // Por defeito, fechado (ex: Segunda a Quinta antes das 08:00)
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
