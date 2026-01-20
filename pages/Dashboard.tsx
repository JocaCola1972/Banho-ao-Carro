
import React, { useState } from 'react';
import { User, Registration, AppSettings, Car } from '../types';
import { areRegistrationsOpen, getWeekNumber, getMonthYearString } from '../utils';
import { 
  AlertCircle, 
  CheckCircle2, 
  Car as CarIcon, 
  Calendar, 
  Key, 
  MapPin, 
  Timer,
  Info,
  Trash2
} from 'lucide-react';

interface DashboardProps {
  user: User;
  registrations: Registration[];
  settings: AppSettings;
  onRegister: (reg: Registration) => void;
  onCancelRegistration: (regId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, registrations, settings, onRegister, onCancelRegistration }) => {
  const [selectedCarId, setSelectedCarId] = useState<string>(user.cars[0]?.id || '');
  const [parkingSpot, setParkingSpot] = useState('');
  
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentMonthYear = getMonthYearString(now);
  const isOpen = areRegistrationsOpen(settings);

  // Check if current user is already registered for THIS week
  const userRegistrationThisWeek = registrations.find(
    r => r.userId === user.id && r.weekNumber === currentWeek && r.year === now.getFullYear()
  );

  // Check if current user already had a wash THIS month
  const userRegistrationThisMonth = registrations.find(
    r => r.userId === user.id && r.month === (now.getMonth() + 1) && r.year === now.getFullYear()
  );

  // Check weekly capacity
  const weeklyTotal = registrations.filter(
    r => r.weekNumber === currentWeek && r.year === now.getFullYear()
  ).length;
  const isFull = weeklyTotal >= settings.weeklyCapacity;

  const handleRegister = () => {
    if (!selectedCarId) return;
    const selectedCar = user.cars.find(c => c.id === selectedCarId);
    if (!selectedCar) return;

    // Fixed typo: corrected 'new hReg' to 'newReg' to fix compilation errors
    const newReg: Registration = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      carId: selectedCarId,
      carDetails: `${selectedCar.brand} ${selectedCar.model} (${selectedCar.licensePlate})`,
      date: new Date().toISOString(),
      weekNumber: currentWeek,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      parkingSpot: parkingSpot
    };

    onRegister(newReg);
  };

  const handleCancel = () => {
    if (userRegistrationThisWeek && confirm('Tem a certeza que deseja cancelar a sua inscrição de lavagem para esta semana?')) {
      onCancelRegistration(userRegistrationThisWeek.id);
    }
  };

  // Logic 3: Registered this week
  if (userRegistrationThisWeek) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 md:p-8 rounded-3xl text-center flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-2 right-2 md:top-4 md:right-4">
            <button
              onClick={handleCancel}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-2 text-[10px] md:text-xs font-bold border border-transparent hover:border-red-500/20"
              title="Cancelar Inscrição"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">CANCELAR INSCRIÇÃO</span>
            </button>
          </div>
          <CheckCircle2 size={48} className="text-emerald-400 mb-4 animate-bounce md:w-16 md:h-16" />
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Lavagem Agendada!</h2>
          <p className="text-slate-300 text-sm md:text-base max-w-md">
            O seu lugar está garantido para esta semana. No dia da lavagem, deve deixar a chave na receção e indicar onde o carro está estacionado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-5 md:p-6 rounded-2xl flex gap-4 items-start">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
              <Key size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Chaves do Veículo</h3>
              <p className="text-xs md:text-sm text-slate-400">No dia da lavagem, deve deixar a chave na receção do edifício.</p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-5 md:p-6 rounded-2xl flex gap-4 items-start">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Localização</h3>
              <p className="text-xs md:text-sm text-slate-400">O seu carro deve estar estacionado no lugar indicado: <span className="text-amber-400 font-mono font-bold">{userRegistrationThisWeek.parkingSpot || 'Não especificado'}</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logic 2: Already washed this month
  if (userRegistrationThisMonth) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl flex flex-col items-center text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
          <Info className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Limite Mensal Atingido</h2>
        <p className="text-slate-400 text-sm md:text-base max-w-sm mb-6">
          Já beneficiou da sua lavagem mensal em {currentMonthYear}. Deverá aguardar pelo próximo mês para uma nova inscrição.
        </p>
        <div className="bg-blue-500/5 px-4 py-2 rounded-lg text-blue-300 text-[10px] md:text-xs font-mono">
          STATUS_CODE: MONTHLY_QUOTA_EXHAUSTED
        </div>
      </div>
    );
  }

  // Logic 1: Registrations full for the week
  if (isFull) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl flex flex-col items-center text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-6">
          <AlertCircle className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Inscrições Esgotadas</h2>
        <p className="text-slate-400 text-sm md:text-base max-w-sm mb-6">
          Infelizmente não conseguiu um lugar nesta semana. Mas não desista, poderá tentar novamente na próxima semana!
        </p>
        <div className="bg-red-500/5 px-4 py-2 rounded-lg text-red-300 text-[10px] md:text-xs font-mono">
          STATUS_CODE: WEEKLY_SLOTS_FULL
        </div>
      </div>
    );
  }

  // Logic: Not open yet
  if (!isOpen) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-3xl flex flex-col items-center text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-6">
          <Timer className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Inscrições Indisponíveis</h2>
        <p className="text-slate-400 text-sm md:text-base max-w-sm mb-6">
          As inscrições para a lavagem dessa semana ainda não abriram e devem aguardar até à abertura das inscrições.
        </p>
        <div className="bg-slate-800/50 px-4 py-2 rounded-lg text-slate-500 text-[10px] md:text-xs font-mono">
          STATUS_CODE: AWAITING_ADMIN_ACTION
        </div>
      </div>
    );
  }

  // Standard flow: Registrations are open, user hasn't registered yet
  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-cyan-900/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-2 uppercase italic tracking-tight">Inscrições Abertas!</h2>
            <p className="text-cyan-100 opacity-90 text-sm md:text-base">Garanta agora o seu lugar para a lavagem desta semana.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex md:flex-col justify-between items-center md:items-start">
            <div className="text-[10px] uppercase font-mono opacity-70 mb-0.5 tracking-wider">Disponíveis</div>
            <div className="text-xl md:text-2xl font-bold">{settings.weeklyCapacity - weeklyTotal} / {settings.weeklyCapacity}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 md:gap-8">
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <CarIcon size={20} />
            </div>
            <h3 className="text-lg md:text-xl font-bold">Protocolo de Inscrição</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500 block font-mono uppercase tracking-widest">Selecionar Veículo</label>
              {user.cars.length > 0 ? (
                <div className="grid gap-3">
                  {user.cars.map(car => (
                    <button
                      key={car.id}
                      onClick={() => setSelectedCarId(car.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        selectedCarId === car.id 
                          ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm md:text-base">{car.brand} {car.model}</div>
                        <div className="text-[10px] md:text-xs opacity-60 font-mono">{car.licensePlate}</div>
                      </div>
                      {selectedCarId === car.id && <CheckCircle2 size={20} className="text-cyan-400 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-800/50 rounded-xl border border-dashed border-slate-700 text-center text-slate-500 text-sm">
                  Nenhum carro registado no seu perfil.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500 block font-mono uppercase tracking-widest">Localização (Onde está o carro?)</label>
              <input
                type="text"
                placeholder="Ex: Lugar 102, Piso -2"
                value={parkingSpot}
                onChange={(e) => setParkingSpot(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 text-sm"
              />
            </div>
          </div>

          <button
            disabled={!selectedCarId || isFull}
            onClick={handleRegister}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
          >
            <Calendar size={18} />
            CONFIRMAR AGENDAMENTO
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
              <Info size={20} className="text-blue-400" />
              Directivas de Serviço
            </h3>
            <ul className="space-y-4 text-slate-400 text-xs md:text-sm">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></div>
                Quota mensal limitada a 01 lavagem por colaborador.
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></div>
                As chaves devem ser depositadas na receção até às 09:30.
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></div>
                Remova bens pessoais valiosos do interior do habitáculo.
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></div>
                O cancelamento tardio pode resultar em suspensão da quota.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
