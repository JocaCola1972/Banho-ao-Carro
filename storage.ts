
import { supabase } from './supabaseClient';
import { User, Registration, AppSettings } from './types';

const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  firstName: 'Admin',
  lastName: 'System',
  phone: '912345678',
  email: 'admin@vaidarbanho.pt',
  password: '123',
  role: 'admin',
  cars: []
};

const DEFAULT_SETTINGS: AppSettings = {
  weeklyCapacity: 10,
  manualOpenWeek: null,
  manualOpenYear: null,
  loginImageUrl: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=1200'
};

export const getStoredUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error || !data || data.length === 0) {
      return [DEFAULT_ADMIN];
    }
    return data;
  } catch (e) {
    console.error("Erro ao carregar utilizadores:", e);
    return [DEFAULT_ADMIN];
  }
};

export const saveUsers = async (users: User[]) => {
  const { error } = await supabase
    .from('users')
    .upsert(users);
  if (error) throw error;
};

export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  if (error) throw error;
};

export const getStoredRegistrations = async (): Promise<Registration[]> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*');
    if (error) return [];
    return data;
  } catch (e) {
    return [];
  }
};

export const saveRegistrations = async (regs: Registration[]) => {
  const { error } = await supabase
    .from('registrations')
    .upsert(regs);
  if (error) throw error;
};

export const deleteRegistration = async (regId: string) => {
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', regId);
  if (error) throw error;
};

export const getStoredSettings = async (): Promise<AppSettings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error || !data) {
      return DEFAULT_SETTINGS;
    }
    // Higienização para garantir que não enviamos lixo para o estado
    return {
      weeklyCapacity: data.weeklyCapacity,
      manualOpenWeek: data.manualOpenWeek,
      manualOpenYear: data.manualOpenYear,
      loginImageUrl: data.loginImageUrl
    };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings) => {
  // Criamos um objeto limpo apenas com as colunas que existem na base de dados
  const payload = {
    id: 1,
    weeklyCapacity: settings.weeklyCapacity,
    manualOpenWeek: settings.manualOpenWeek,
    manualOpenYear: settings.manualOpenYear,
    loginImageUrl: settings.loginImageUrl
  };

  const { error } = await supabase
    .from('settings')
    .upsert(payload);
  if (error) throw error;
};
