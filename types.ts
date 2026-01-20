
export interface Car {
  id: string;
  brand: string;
  model: string;
  licensePlate: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  cars: Car[];
}

export interface Registration {
  id: string;
  userId: string;
  carId: string;
  userName: string;
  carDetails: string;
  date: string; // ISO String
  weekNumber: number;
  month: number;
  year: number;
  parkingSpot?: string;
}

export interface AppSettings {
  weeklyCapacity: number;
  manualOpenWeek: number | null;
  manualOpenYear: number | null;
  manualCloseWeek: number | null;
  manualCloseYear: number | null;
  loginImageUrl: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
