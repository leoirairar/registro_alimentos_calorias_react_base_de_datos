import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { DailyGoal } from '../types';

function calcBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'female') {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

export default function Progreso() {
  const [goal, setGoal] = useState<DailyGoal>({ calories: 2000, protein: 150, fat: 65, carbs: 200, heightCm: 170, age: 30, gender: 'male' });
  const [weights, setWeights] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [waistSaved, setWaistSaved] = useState(false);

  useEffect(() => {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    const dateFrom = threeMonthsAgo.toISOString().slice(0, 10);
    const dateTo = today.toISOString().slice(0, 10);

    Promise.all([
      api.getGoal(),
      api.getWeightsRange(dateFrom, dateTo),
      api.getMeasurementsRange(dateFrom, dateTo),
      api.getMeasurement(today.toISOString().slice(0, 10)),
    ]).then(([g, w, m, lastM]) => {
      setGoal(g);
      setWeights(w);
      setMeasurements(m);
      if (lastM?.waistCm) {
        setWaist(String(lastM.waistCm));
        setWaistSaved(true);
      }
      if (lastM?.hipCm) setHip(String(lastM.hipCm));
    });
  }, []);

  const lastWeight = weights.length > 0 ? weights[weights.length - 1].weightKg : 0;
  const firstWeight = weights.length > 0 ? weights[0].weightKg : 0;

  const bmr = lastWeight > 0 ? calcBMR(lastWeight, goal.heightCm || 170, goal.age || 30, goal.gender || 'male') : 0;
  const tdee = Math.round(bmr * 1.375);
  const avgCal = goal.calories;

  const dailyDeficit = tdee - avgCal;
  const weeklyLoss = dailyDeficit > 0 ? (dailyDeficit * 7) / 7700 : 0;
  const weeklyLossG = weeklyLoss * 1000;

  const projection: { week: number; date: string; weight: number }[] = [];
  if (lastWeight > 0 && weeklyLoss > 0) {
    const today = new Date();
    for (let w = 1; w <= 8; w++) {
      const d = new Date(today);
      d.setDate(d.getDate() + w * 7);
      projection.push({
        week: w,
        date: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        weight: Math.round((lastWeight - weeklyLoss * w) * 10) / 10,
      });
    }
  }

  const waistEntries = measurements.filter(m => m.waistCm);
  const lastWaist = waistEntries.length > 0 ? waistEntries[waistEntries.length - 1].waistCm : 0;
  const firstWaist = waistEntries.length > 0 ? waistEntries[0].waistCm : 0;
  const waistChange = firstWaist && lastWaist ? (lastWaist - firstWaist).toFixed(1) : '—';

  const weightDiff = firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : '—';

  const handleSaveWaist = async () => {
    if (!waist) return;
    const today = new Date().toISOString().slice(0, 10);
    await api.saveMeasurement(today, { waistCm: parseFloat(waist), hipCm: hip ? parseFloat(hip) : null });
    setWaistSaved(true);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">📈 Progreso</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-lg font-bold text-purple-600">{bmr}</div>
          <div className="text-xs text-gray-500">TMB (BMR)</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-lg font-bold text-blue-500">{tdee}</div>
          <div className="text-xs text-gray-500">Gasto total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className={`text-lg font-bold ${avgCal < tdee ? 'text-green-500' : 'text-red-500'}`}>{avgCal}</div>
          <div className="text-xs text-gray-500">Tu meta</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-lg font-bold text-amber-600">{dailyDeficit > 0 ? `${dailyDeficit}` : '—'}</div>
          <div className="text-xs text-gray-500">Déficit diario</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold mb-3 text-sm text-gray-600">📏 Medidas corporales</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cintura (cm)</label>
            <div className="flex gap-2">
              <input
                type="number" step="0.5"
                value={waist} onChange={e => { setWaist(e.target.value); setWaistSaved(false); }}
                placeholder="Ej: 85"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cadera (cm)</label>
            <div className="flex gap-2">
              <input
                type="number" step="0.5"
                value={hip} onChange={e => setHip(e.target.value)}
                placeholder="Ej: 95"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
        <button onClick={handleSaveWaist} className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${waistSaved ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
          {waistSaved ? '✔ Guardado' : 'Guardar medidas'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Peso inicial</div>
          <div className="text-lg font-bold">{firstWeight || '—'} kg</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Peso actual</div>
          <div className="text-lg font-bold">{lastWeight || '—'} kg</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Cambio peso</div>
          <div className={`text-lg font-bold ${Number(weightDiff) < 0 ? 'text-green-500' : Number(weightDiff) > 0 ? 'text-red-500' : ''}`}>
            {weightDiff} kg
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Cambio cintura</div>
          <div className={`text-lg font-bold ${Number(waistChange) < 0 ? 'text-green-500' : Number(waistChange) > 0 ? 'text-red-500' : ''}`}>
            {waistChange} cm
          </div>
        </div>
      </div>

      {projection.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-3 text-sm text-gray-600">📅 Proyección semanal</h3>
          <div className="text-xs text-gray-400 mb-3">
            Déficit ~{dailyDeficit} kcal/día → ~{weeklyLossG.toFixed(0)}g por semana
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left py-2 font-medium">Semana</th>
                  <th className="text-left py-2 font-medium">Fecha</th>
                  <th className="text-right py-2 font-medium">Peso estimado</th>
                  <th className="text-right py-2 font-medium">Pérdida</th>
                </tr>
              </thead>
              <tbody>
                {projection.map(p => {
                  const loss = p.weight - lastWeight;
                  return (
                    <tr key={p.week} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 font-medium">Sem {p.week}</td>
                      <td className="py-2 text-gray-500">{p.date}</td>
                      <td className={`py-2 text-right font-medium ${p.weight < lastWeight ? 'text-green-600' : ''}`}>
                        {p.weight} kg
                      </td>
                      <td className={`py-2 text-right ${loss < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                        {loss.toFixed(1)} kg
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
