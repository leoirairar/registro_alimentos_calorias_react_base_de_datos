import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { DailyGoal } from '../types';

export default function Settings() {
  const [goal, setGoal] = useState<DailyGoal>({ calories: 2000, protein: 150, fat: 65, carbs: 200 });

  useEffect(() => { api.getGoal().then(setGoal); }, []);

  const handleSave = async () => {
    await api.updateGoal(goal);
    alert('Metas guardadas');
  };

  const updNum = (k: keyof DailyGoal) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setGoal({ ...goal, [k]: Number(e.target.value) });

  const updGender = (gender: 'male' | 'female') => setGoal({ ...goal, gender });

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-bold">Configuración</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-sm text-gray-600">📏 Datos corporales</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Altura (cm)</label>
            <input type="number" value={goal.heightCm} onChange={updNum('heightCm')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Edad</label>
            <input type="number" value={goal.age} onChange={updNum('age')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sexo</label>
            <select value={goal.gender} onChange={e => updGender(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Peso inicial (kg)</label>
            <input type="number" step="0.1" value={goal.initialWeightKg ?? ''} onChange={e => setGoal({ ...goal, initialWeightKg: e.target.value ? Number(e.target.value) : null })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-sm text-gray-600">🎯 Metas diarias</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calorías</label>
          <input type="number" value={goal.calories} onChange={updNum('calories')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proteínas (g)</label>
          <input type="number" value={goal.protein} onChange={updNum('protein')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grasas (g)</label>
          <input type="number" value={goal.fat} onChange={updNum('fat')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carbohidratos (g)</label>
          <input type="number" value={goal.carbs} onChange={updNum('carbs')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
