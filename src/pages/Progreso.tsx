import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { fmt } from '../utils/calculations';
import type { DailyGoal } from '../types';
import Toast from '../components/Toast';

function calcBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'female') {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

function getWeekId(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const y = d.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  return `${y}-W${String(Math.ceil((days + jan1.getDay() + 1) / 7)).padStart(2, '0')}`;
}

function formatWeekRange(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const opt = { day: 'numeric', month: 'short' } as const;
  return `${mon.toLocaleDateString('es-ES', opt)} - ${sun.toLocaleDateString('es-ES', opt)}`;
}

export default function Progreso() {
  const [goal, setGoal] = useState<DailyGoal>({ calories: 2000, protein: 150, fat: 65, carbs: 200, fiber: 25, heightCm: 170, age: 30, gender: 'male' });
  const [weights, setWeights] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [waistSaved, setWaistSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

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
  const refWeight = goal.initialWeightKg || firstWeight;

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

  const weekMap = new Map<string, any[]>();
  for (const w of weights) {
    const wid = getWeekId(w.entryDate);
    if (!weekMap.has(wid)) weekMap.set(wid, []);
    weekMap.get(wid)!.push(w);
  }
  const weeks = Array.from(weekMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  const waistEntries = measurements.filter(m => m.waistCm);
  const lastWaist = waistEntries.length > 0 ? waistEntries[waistEntries.length - 1].waistCm : 0;
  const firstWaist = waistEntries.length > 0 ? waistEntries[0].waistCm : 0;
  const waistChange = firstWaist && lastWaist ? (lastWaist - firstWaist).toFixed(1) : '—';

  const weightDiff = refWeight && lastWeight ? (lastWeight - refWeight).toFixed(1) : '—';

  const handleSaveWaist = async () => {
    const e: Record<string, string> = {};
    if (!waist || Number(waist) < 40 || Number(waist) > 200) e.waist = 'Debe ser entre 40 y 200 cm';
    if (hip && (Number(hip) < 40 || Number(hip) > 200)) e.hip = 'Debe ser entre 40 y 200 cm';
    setErrors(e);
    if (Object.keys(e).length) return;
    const today = new Date().toISOString().slice(0, 10);
    await api.saveMeasurement(today, { waistCm: parseFloat(waist), hipCm: hip ? parseFloat(hip) : null });
    setWaistSaved(true);
    setToast('Medidas guardadas');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">📈 Progreso</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-lg font-bold text-blue-500">{tdee}</div>
          <div className="text-xs text-gray-500">Gasto total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className={`text-lg font-bold ${avgCal < tdee ? 'text-green-500' : 'text-red-500'}`}>{avgCal}</div>
          <div className="text-xs text-gray-500">Tu meta</div>
        </div>
      </div>

      {dailyDeficit > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-lg font-bold text-amber-600">{fmt(dailyDeficit * 7)} kcal/semana</div>
            <div className="text-xs text-gray-500">Déficit semanal</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-lg font-bold text-green-600">~{weeklyLossG.toFixed(0)} g/semana</div>
            <div className="text-xs text-gray-500">Pérdida estimada</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold mb-3 text-sm text-gray-600">📏 Medidas corporales</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cintura (cm)</label>
            <div className="flex gap-2">
              <input
                type="number" step="0.5"
                value={waist} onChange={e => { setWaist(e.target.value); setWaistSaved(false); setErrors(p => ({ ...p, waist: '' })); }}
                placeholder="Ej: 85"
                className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.waist ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
            </div>
            {errors.waist && <p className="text-red-500 text-xs mt-1">{errors.waist}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cadera (cm)</label>
            <div className="flex gap-2">
              <input
                type="number" step="0.5"
                value={hip} onChange={e => { setHip(e.target.value); setErrors(p => ({ ...p, hip: '' })); }}
                placeholder="Ej: 95"
                className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.hip ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
            </div>
            {errors.hip && <p className="text-red-500 text-xs mt-1">{errors.hip}</p>}
          </div>
        </div>
        <button onClick={handleSaveWaist} className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${waistSaved ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
          {waistSaved ? '✔ Guardado' : 'Guardar medidas'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-xs text-gray-500">Peso inicial</div>
          <div className="text-lg font-bold">{refWeight || '—'} kg</div>
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

      {weeks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-3 text-sm text-gray-600">📅 Registro semanal</h3>
          <div className="space-y-1">
            {weeks.map(([wid, wEntries]) => {
              const first = wEntries[0].weightKg;
              const last = wEntries[wEntries.length - 1].weightKg;
              const change = last - first;
              const open = expandedWeek === wid;
              const weekMeas = measurements.filter(m => {
                if (!m.waistCm) return false;
                const mWeek = getWeekId(m.entryDate);
                return mWeek === wid;
              });
              const firstWaistW = weekMeas.length > 0 ? weekMeas[0].waistCm : null;
              const lastWaistW = weekMeas.length > 0 ? weekMeas[weekMeas.length - 1].waistCm : null;
              const waistChangeW = firstWaistW && lastWaistW ? (lastWaistW - firstWaistW).toFixed(1) : null;
              return (
                <div key={wid}>
                  <button
                    onClick={() => setExpandedWeek(open ? null : wid)}
                    className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`transform transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
                      <span className="font-medium">{formatWeekRange(wEntries[0].entryDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span>{first.toFixed(1)} kg</span>
                      <span className="text-gray-300">→</span>
                      <span className={change < 0 ? 'text-green-600 font-medium' : change > 0 ? 'text-red-600 font-medium' : ''}>
                        {last.toFixed(1)} kg
                      </span>
                      <span className={`text-xs ${change < 0 ? 'text-green-500' : change > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </span>
                    </div>
                  </button>
                  {open && (
                    <div className="ml-6 pb-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">Inicio</div>
                          <div className="text-sm font-bold">{first.toFixed(1)} kg</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">Actual</div>
                          <div className="text-sm font-bold">{last.toFixed(1)} kg</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">Cambio</div>
                          <div className={`text-sm font-bold ${change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : ''}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                          </div>
                        </div>
                        {waistChangeW && (
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500">Cintura</div>
                            <div className={`text-sm font-bold ${Number(waistChangeW) < 0 ? 'text-green-600' : Number(waistChangeW) > 0 ? 'text-red-600' : ''}`}>
                              {Number(waistChangeW) > 0 ? '+' : ''}{waistChangeW} cm
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-100 pt-2 space-y-1">
                        {wEntries.map((entry: any) => {
                          const d = new Date(entry.entryDate + 'T12:00:00');
                          const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
                          return (
                            <div key={entry.id} className="flex items-center justify-between text-xs py-1 px-2 text-gray-500">
                              <span className="capitalize">{dayName} {d.getDate()}</span>
                              <span className="font-medium text-gray-700">{entry.weightKg.toFixed(1)} kg</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={closeToast} />}
    </div>
  );
}
