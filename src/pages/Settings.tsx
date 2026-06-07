import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { DailyGoal } from '../types';
import { COUNTRIES } from '../types';
import Toast from '../components/Toast';

interface Errors {
  heightCm?: string; age?: string; initialWeightKg?: string;
  calories?: string; protein?: string; fat?: string; carbs?: string; fiber?: string;
}

export default function Settings() {
  const [goal, setGoal] = useState<DailyGoal>({ calories: 2000, protein: 150, fat: 65, carbs: 200, fiber: 25 });
  const [toast, setToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => { api.getGoal().then(setGoal); }, []);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!goal.heightCm || goal.heightCm < 100 || goal.heightCm > 250) e.heightCm = 'Debe ser entre 100 y 250 cm';
    if (!goal.age || goal.age < 10 || goal.age > 120) e.age = 'Debe ser entre 10 y 120 años';
    if (goal.initialWeightKg != null && (goal.initialWeightKg < 20 || goal.initialWeightKg > 400)) e.initialWeightKg = 'Debe ser entre 20 y 400 kg';
    if (!goal.calories || goal.calories < 500 || goal.calories > 10000) e.calories = 'Debe ser entre 500 y 10000 kcal';
    if (goal.protein < 0 || goal.protein > 1000) e.protein = 'Debe ser entre 0 y 1000 g';
    if (goal.fat < 0 || goal.fat > 1000) e.fat = 'Debe ser entre 0 y 1000 g';
    if (goal.carbs < 0 || goal.carbs > 1000) e.carbs = 'Debe ser entre 0 y 1000 g';
    if (goal.fiber < 0 || goal.fiber > 200) e.fiber = 'Debe ser entre 0 y 200 g';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await api.updateGoal(goal);
      setToast('Metas guardadas');
    } catch {
      setToast('Error al guardar');
    }
  };

  const closeToast = useCallback(() => setToast(null), []);

  const updNum = (k: keyof DailyGoal) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(p => ({ ...p, [k]: undefined }));
    setGoal({ ...goal, [k]: Number(e.target.value) });
  };

  const updGender = (gender: 'male' | 'female') => setGoal({ ...goal, gender });

  const inputCls = (field: keyof Errors) =>
    `w-full border rounded-lg px-3 py-2 text-sm ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-bold">⚙️ Configuración</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-sm text-gray-600 mb-3">📏 Datos corporales</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Altura (cm)</label>
            <input type="number" value={goal.heightCm} onChange={updNum('heightCm')} className={inputCls('heightCm')} />
            {errors.heightCm && <p className="text-red-500 text-xs mt-1">{errors.heightCm}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Edad</label>
            <input type="number" value={goal.age} onChange={updNum('age')} className={inputCls('age')} />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
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
            <input type="number" step="0.1" value={goal.initialWeightKg ?? ''} onChange={e => { setErrors(p => ({ ...p, initialWeightKg: undefined })); setGoal({ ...goal, initialWeightKg: e.target.value ? Number(e.target.value) : null }); }} className={inputCls('initialWeightKg')} />
            {errors.initialWeightKg && <p className="text-red-500 text-xs mt-1">{errors.initialWeightKg}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-sm text-gray-600 mb-3">🎯 Metas diarias</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Calorías</label>
            <input type="number" value={goal.calories} onChange={updNum('calories')} className={inputCls('calories')} />
            {errors.calories && <p className="text-red-500 text-xs mt-1">{errors.calories}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Proteínas (g)</label>
            <input type="number" value={goal.protein} onChange={updNum('protein')} className={inputCls('protein')} />
            {errors.protein && <p className="text-red-500 text-xs mt-1">{errors.protein}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Grasas (g)</label>
            <input type="number" value={goal.fat} onChange={updNum('fat')} className={inputCls('fat')} />
            {errors.fat && <p className="text-red-500 text-xs mt-1">{errors.fat}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Carbohidratos (g)</label>
            <input type="number" value={goal.carbs} onChange={updNum('carbs')} className={inputCls('carbs')} />
            {errors.carbs && <p className="text-red-500 text-xs mt-1">{errors.carbs}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fibra (g)</label>
            <input type="number" value={goal.fiber} onChange={updNum('fiber')} className={inputCls('fiber')} />
            {errors.fiber && <p className="text-red-500 text-xs mt-1">{errors.fiber}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-sm text-gray-600 mb-3">🌎 País / Formato de hora</h3>
        <select
          value={goal.locale || 'es-CL'}
          onChange={e => setGoal({ ...goal, locale: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {COUNTRIES.map(c => (
            <option key={c.locale} value={c.locale}>{c.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">El formato de hora (12h/24h) se ajusta automáticamente según el país</p>
      </div>

      <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
        💾 Guardar configuración
      </button>

      {toast && <Toast message={toast} onClose={closeToast} />}
    </div>
  );
}
