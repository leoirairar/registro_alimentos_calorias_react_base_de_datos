import { fmt } from '../utils/calculations';

interface Props {
  totals: { calories: number; protein: number; fat: number; carbs: number; fiber: number; caloriesBurned: number };
  goal: { calories: number; protein: number; fat: number; carbs: number; fiber: number };
  wentToGym: boolean;
  bodyParts: string[];
  steps: number;
}

export default function DailyAnalysis({ totals, goal, wentToGym, bodyParts, steps }: Props) {
  const netCal = totals.calories - totals.caloriesBurned;
  const calPct = goal.calories > 0 ? Math.round((netCal / goal.calories) * 100) : 0;
  const proPct = goal.protein > 0 ? Math.round((totals.protein / goal.protein) * 100) : 0;

  const feedback: { label: string; color: string; icon: string }[] = [];

  if (totals.protein >= goal.protein) {
    feedback.push({ label: 'Proteína completa', color: 'text-emerald-600', icon: '✅' });
  } else {
    const falta = Math.round(goal.protein - totals.protein);
    feedback.push({ label: `Faltan ${fmt(falta)}g de proteína`, color: 'text-amber-600', icon: '⚠️' });
  }

  const calDiff = netCal - goal.calories;
  if (calDiff > 100) {
    feedback.push({ label: `Excediste ${fmt(calDiff)} kcal`, color: 'text-red-500', icon: '🔴' });
  } else if (calDiff < -100) {
    feedback.push({ label: `Déficit de ${fmt(Math.abs(calDiff))} kcal`, color: 'text-green-600', icon: '✅' });
  } else {
    feedback.push({ label: `${calDiff >= 0 ? '+' : ''}${fmt(calDiff)} kcal — en rango`, color: 'text-amber-500', icon: '🟡' });
  }

  if (wentToGym) {
    feedback.push({ label: `Gimnasio: ${bodyParts.join(', ') || 'completo'}`, color: 'text-amber-600', icon: '🏋️' });
  } else {
    feedback.push({ label: 'Sin gimnasio hoy', color: 'text-gray-400', icon: '⏸️' });
  }

  if (steps >= 10000) {
    feedback.push({ label: `${fmt(steps)} pasos — meta cumplida`, color: 'text-emerald-600', icon: '🚶' });
  } else if (steps > 0) {
    const falta = 10000 - steps;
    feedback.push({ label: `${fmt(steps)} pasos — faltan ${fmt(falta)}`, color: 'text-amber-600', icon: '🚶' });
  } else {
    feedback.push({ label: 'Sin registro de pasos', color: 'text-gray-400', icon: '🚶' });
  }

  if (totals.caloriesBurned > 0) {
    feedback.push({ label: `${fmt(totals.caloriesBurned)} kcal quemadas`, color: 'text-amber-600', icon: '🔥' });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold mb-3 text-sm">📊 Análisis del día</h3>
      <div className="space-y-1.5">
        {feedback.map((f, i) => (
          <div key={i} className={`text-sm ${f.color} flex items-center gap-2`}>
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1 text-center text-[10px]">
        <div>
          <div className={`font-medium ${proPct >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{proPct}%</div>
          <div className="text-gray-400">Proteína</div>
        </div>
        <div>
          <div className={`font-medium ${calPct > 100 ? 'text-red-500' : calPct > 85 ? 'text-emerald-600' : 'text-blue-500'}`}>{calPct}%</div>
          <div className="text-gray-400">Calorías</div>
        </div>
        <div>
          <div className={`font-medium ${totals.carbs >= goal.carbs ? 'text-emerald-600' : 'text-amber-600'}`}>
            {goal.carbs > 0 ? Math.round((totals.carbs / goal.carbs) * 100) : 0}%
          </div>
          <div className="text-gray-400">Carbs</div>
        </div>
        <div>
          <div className={`font-medium ${totals.fat >= goal.fat ? 'text-emerald-600' : 'text-amber-600'}`}>
            {goal.fat > 0 ? Math.round((totals.fat / goal.fat) * 100) : 0}%
          </div>
          <div className="text-gray-400">Grasas</div>
        </div>
        <div>
          <div className={`font-medium ${totals.fiber >= goal.fiber ? 'text-emerald-600' : 'text-amber-600'}`}>
            {goal.fiber > 0 ? Math.round((totals.fiber / goal.fiber) * 100) : 0}%
          </div>
          <div className="text-gray-400">Fibra</div>
        </div>
      </div>
    </div>
  );
}
