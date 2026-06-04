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

  const h = (k: keyof DailyGoal) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setGoal({ ...goal, [k]: Number(e.target.value) });

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Metas diarias</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calorías</label>
          <input type="number" value={goal.calories} onChange={h('calories')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proteínas (g)</label>
          <input type="number" value={goal.protein} onChange={h('protein')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grasas (g)</label>
          <input type="number" value={goal.fat} onChange={h('fat')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carbohidratos (g)</label>
          <input type="number" value={goal.carbs} onChange={h('carbs')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          Guardar metas
        </button>
      </div>
    </div>
  );
}
