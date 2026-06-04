import type { DailyGoal, DailyTotals } from '../types';

interface Props {
  totals: DailyTotals;
  goal: DailyGoal;
  date: string;
}

export default function MacroSummary({ totals, goal, date }: Props) {
  const netCalories = totals.calories - totals.caloriesBurned;

  const pctCal = goal.calories > 0 ? Math.round((netCalories / goal.calories) * 100) : 0;
  const pctPro = goal.protein > 0 ? Math.round((totals.protein / goal.protein) * 100) : 0;
  const pctFat = goal.fat > 0 ? Math.round((totals.fat / goal.fat) * 100) : 0;
  const pctCarbs = goal.carbs > 0 ? Math.round((totals.carbs / goal.carbs) * 100) : 0;

  const bar = (pct: number, color: string) => (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{date}</span>
        <span className="font-medium text-gray-700">
          {netCalories >= 0 ? `${netCalories} kcal` : `${Math.abs(netCalories)} kcal deficit`}
        </span>
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span>Calorías</span>
          <span>{netCalories} / {goal.calories} ({pctCal}%)</span>
        </div>
        {bar(pctCal, 'bg-emerald-500')}
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span>Proteínas</span>
          <span>{totals.protein}g / {goal.protein}g ({pctPro}%)</span>
        </div>
        {bar(pctPro, 'bg-blue-500')}
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span>Grasas</span>
          <span>{totals.fat}g / {goal.fat}g ({pctFat}%)</span>
        </div>
        {bar(pctFat, 'bg-amber-500')}
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span>Carbohidratos</span>
          <span>{totals.carbs}g / {goal.carbs}g ({pctCarbs}%)</span>
        </div>
        {bar(pctCarbs, 'bg-rose-500')}
      </div>

      {totals.caloriesBurned > 0 && (
        <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
          🔥 {totals.caloriesBurned} kcal quemadas con ejercicio
        </div>
      )}
    </div>
  );
}
