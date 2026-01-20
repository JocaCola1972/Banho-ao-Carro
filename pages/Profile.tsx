
import React, { useState } from 'react';
import { User, Car } from '../types';
import { Save, Plus, Trash2, Key, User as UserIcon, Car as CarIcon } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState<User>({ ...user });
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddCar = () => {
    const newCar: Car = {
      id: crypto.randomUUID(),
      brand: '',
      model: '',
      licensePlate: ''
    };
    setFormData({ ...formData, cars: [...formData.cars, newCar] });
  };

  const handleCarChange = (id: string, field: keyof Car, value: string) => {
    const updatedCars = formData.cars.map(c => c.id === id ? { ...c, [field]: value } : c);
    setFormData({ ...formData, cars: updatedCars });
  };

  const handleRemoveCar = (id: string) => {
    setFormData({ ...formData, cars: formData.cars.filter(c => c.id !== id) });
  };

  const handleSave = () => {
    const updatedUser = { ...formData };
    if (newPassword) {
      updatedUser.password = newPassword;
    }
    onUpdateUser(updatedUser);
    setSuccess('Perfil atualizado com sucesso!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <UserIcon className="text-cyan-400" />
          O Meu Perfil
        </h2>
        <button
          onClick={handleSave}
          className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-6 py-2 rounded-xl transition-all flex items-center gap-2"
        >
          <Save size={20} />
          Guardar Alterações
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm animate-in fade-in">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-bold border-b border-slate-800 pb-4 flex items-center gap-2">
            <UserIcon size={20} className="text-slate-500" />
            Dados Pessoais
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400 font-mono">Primeiro Nome</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400 font-mono">Último Nome</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-mono">Telemóvel</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-mono">Nova Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                placeholder="Deixe em branco para manter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Cars */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CarIcon size={20} className="text-slate-500" />
              Os Meus Carros
            </h3>
            <button
              onClick={handleAddCar}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-cyan-400 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
            {formData.cars.length === 0 && (
              <p className="text-center text-slate-500 py-8">Ainda não adicionou nenhum veículo.</p>
            )}
            {formData.cars.map((car, index) => (
              <div key={car.id} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 relative group">
                <button
                  onClick={() => handleRemoveCar(car.id)}
                  className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 size={14} />
                </button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-mono">Marca</label>
                    <input
                      type="text"
                      value={car.brand}
                      onChange={(e) => handleCarChange(car.id, 'brand', e.target.value)}
                      placeholder="BMW, Tesla..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-mono">Modelo</label>
                    <input
                      type="text"
                      value={car.model}
                      onChange={(e) => handleCarChange(car.id, 'model', e.target.value)}
                      placeholder="Série 3, Model 3..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-mono">Matrícula</label>
                  <input
                    type="text"
                    value={car.licensePlate}
                    onChange={(e) => handleCarChange(car.id, 'licensePlate', e.target.value)}
                    placeholder="AA-00-BB"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm focus:border-cyan-500 outline-none font-mono tracking-widest uppercase"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
