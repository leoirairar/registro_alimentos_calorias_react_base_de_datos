import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import { api } from '../api/client';
import { calcDailyTotals, getMonthDays } from '../utils/calculations';
import type { DailyGoal } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [foods, setFoods] = useState<any[]>([]);
  const [foodEntries, setFoodEntries] = useState<any[]>([]);
  const [movementEntries, setMovementEntries] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [goal, setGoal] = useState<DailyGoal>({ calories: 2000, protein: 150, fat: 65, carbs: 200 });

  useEffect(() => {
    const days = getMonthDays(year, month);
    const dateFrom = days[0].toISOString().slice(0, 10);
    const dateTo = days[days.length - 1].toISOString().slice(0, 10);

    Promise.all([
      api.getFoods(),
      api.getFoodEntriesRange(dateFrom, dateTo),
      api.getMovementEntriesRange(dateFrom, dateTo),
      api.getWorkoutsRange(dateFrom, dateTo),
      api.getWeightsRange(dateFrom, dateTo),
      api.getGoal(),
    ]).then(([f, fe, me, wo, we, g]) => {
      setFoods(f);
      setFoodEntries(fe);
      setMovementEntries(me);
      setWorkouts(wo);
      setWeights(we);
      setGoal(g);
    });
  }, [year, month]);

  const days = getMonthDays(year, month);

  const workoutMap: Record<string, boolean> = {};
  for (const w of workouts) {
    if (w.wentToGym) workoutMap[w.entryDate] = true;
  }

  const weightMap: Record<string, number> = {};
  for (const w of weights) {
    weightMap[w.entryDate] = w.weightKg;
  }

  let totalProtein = 0;
  let daysWithProtein = 0;
  const dayData: Record<string, { netCalories: number; goalCalories: number; wentToGym?: boolean; weight?: number }> = {};
  for (const d of days) {
    const ds = d.toISOString().slice(0, 10);
    const totals = calcDailyTotals(ds, foodEntries, movementEntries, foods);
    dayData[ds] = {
      netCalories: totals.calories - totals.caloriesBurned,
      goalCalories: goal.calories,
      wentToGym: workoutMap[ds] || false,
      weight: weightMap[ds],
    };
    if (totals.protein > 0) {
      totalProtein += totals.protein;
      daysWithProtein++;
    }
  }

  const sortedWeightEntries = [...weights].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
  const currentWeight = sortedWeightEntries.length > 0 ? sortedWeightEntries[sortedWeightEntries.length - 1].weightKg : 0;
  const refWeight = goal.initialWeightKg || (sortedWeightEntries.length > 0 ? sortedWeightEntries[0].weightKg : 0);
  const weightDiff = refWeight && currentWeight ? (currentWeight - refWeight).toFixed(1) : '—';
  const weightDiffNum = Number(weightDiff);

  const avgProtein = daysWithProtein > 0 ? Math.round(totalProtein / daysWithProtein) : 0;
  const daysOverGoal = Object.values(dayData).filter(d => d.netCalories > d.goalCalories).length;
  const daysLogged = Object.values(dayData).filter(d => d.netCalories > 0).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{avgProtein}g</div>
          <div className="text-xs text-gray-500">Proteínas / día</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{daysLogged}</div>
          <div className="text-xs text-gray-500">Días con registro</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className={`text-2xl font-bold ${daysOverGoal > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{daysOverGoal}</div>
          <div className="text-xs text-gray-500">Días sobre meta</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{currentWeight > 0 ? currentWeight : '—'}</div>
          <div className="text-xs text-gray-500">
            {currentWeight > 0 ? `${currentWeight}kg` : 'Peso'}
            {weightDiffNum !== 0 && (
              <span className={weightDiffNum < 0 ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
                ({weightDiffNum > 0 ? '+' : ''}{weightDiff}kg)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-sm text-gray-600 mb-3">⚖️ Registro de peso diario</h3>
        {sortedWeightEntries.length === 0 ? (
          <p className="text-sm text-gray-400">Sin registros este mes</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedWeightEntries.map(w => {
              const delta = refWeight ? (w.weightKg - refWeight).toFixed(1) : null;
              const deltaNum = Number(delta || 0);
              return (
                <div key={w.entryDate} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500">{w.entryDate}</span>
                  <span className="font-medium">{w.weightKg} kg</span>
                  {delta !== null && (
                    <span className={deltaNum <= 0 ? 'text-green-600 text-xs' : 'text-red-500 text-xs'}>
                      {deltaNum > 0 ? '+' : ''}{delta} kg
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Calendar
        year={year}
        month={month}
        onPrevMonth={() => setMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1)}
        onNextMonth={() => setMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1)}
        onDayClick={(ds) => navigate(`/log/${ds}`)}
        dayData={dayData}
      />

      <div className="text-center">
        <button
          onClick={() => navigate(`/log/${today.toISOString().slice(0, 10)}`)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-md"
        >
          + Registrar hoy
        </button>
      </div>
    </div>
  );
}
