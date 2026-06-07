import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { calcNutrients, formatDateShort, fmt } from '../utils/calculations';
import MacroSummary from '../components/MacroSummary';
import ReferenciaPesos from '../components/ReferenciaPesos';
import GymSection from '../components/GymSection';
import WeightSection from '../components/WeightSection';
import DailyAnalysis from '../components/DailyAnalysis';
import Toast from '../components/Toast';
import type { DailyGoal } from '../types';

function groupByMeal(entries: any[], gapMinutes = 60) {
  if (!entries.length) return [];
  const sorted = [...entries].sort((a, b) => a.datetime.localeCompare(b.datetime));
  const meals: { time: string; entries: any[] }[] = [{ time: sorted[0].datetime.slice(11, 16), entries: [sorted[0]] }];
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].datetime);
    const curr = new Date(sorted[i].datetime);
    const diff = (curr.getTime() - prev.getTime()) / 60000;
    if (diff >= gapMinutes) {
      meals.push({ time: sorted[i].datetime.slice(11, 16), entries: [sorted[i]] });
    } else {
      meals[meals.length - 1].entries.push(sorted[i]);
    }
  }
  return meals;
}

export default function DailyLog() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const d = date || today;

  const [foods, setFoods] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [goal, setGoal] = useState<DailyGoal>({ calories: 2000, protein: 150, fat: 65, carbs: 200, fiber: 25 });
  const [toast, setToast] = useState<string | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [showFoodDropdown, setShowFoodDropdown] = useState(false);
  const [grams, setGrams] = useState('100');
  const [movementDesc, setMovementDesc] = useState('');
  const [movementCal, setMovementCal] = useState('');
  const [steps, setSteps] = useState('');
  const [workoutData, setWorkoutData] = useState<any>({ wentToGym: false, bodyParts: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const searchRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    Promise.all([
      api.getFoods(),
      api.getFoodEntries(d),
      api.getMovementEntries(d),
      api.getGoal(),
      api.getWorkout(d),
    ]).then(([f, fe, me, g, wo]) => {
      setFoods(f);
      setEntries(fe);
      setMovements(me);
      setGoal(g);
      setWorkoutData(wo);
    });
  };

  useEffect(() => { loadData(); }, [d]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowFoodDropdown(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const dayEntries = entries.filter((e: any) => e.datetime.startsWith(d));
  const dayMovements = movements.filter((m: any) => m.datetime.startsWith(d));

  const handleSelectFood = (id: string) => {
    setSelectedFoodId(id);
    const f = foods.find(x => x.id === id);
    setFoodSearch(f?.name || '');
    setShowFoodDropdown(false);
  };

  const handleAddFood = async () => {
    const e: Record<string, string> = {};
    if (!selectedFoodId) e.food = 'Selecciona un alimento de la lista';
    if (!grams || Number(grams) < 1 || Number(grams) > 9999) e.grams = 'Debe ser entre 1 y 9999 g';
    setErrors(e);
    if (Object.keys(e).length) return;
    await api.createFoodEntry({
      foodItemId: selectedFoodId,
      grams: Number(grams),
      datetime: d + 'T' + new Date().toTimeString().slice(0, 5),
    });
    loadData();
    setGrams('100');
    setSelectedFoodId('');
    setFoodSearch('');
    setToast('Alimento agregado');
  };

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const handleAddMovement = async () => {
    const e: Record<string, string> = {};
    if (!movementDesc.trim()) e.movementDesc = 'Describe el ejercicio';
    if (!movementCal || Number(movementCal) < 1 || Number(movementCal) > 10000) e.movementCal = 'Debe ser entre 1 y 10000 kcal';
    setErrors(p => ({ ...p, ...e }));
    if (Object.keys(e).length) return;
    await api.createMovementEntry({
      description: movementDesc,
      caloriesBurned: Number(movementCal),
      datetime: d + 'T' + new Date().toTimeString().slice(0, 5),
    });
    loadData();
    setMovementDesc('');
    setMovementCal('');
    setErrors(p => ({ ...p, movementDesc: '', movementCal: '' }));
    setToast('Ejercicio agregado');
  };

  const handleAddSteps = async () => {
    const e: Record<string, string> = {};
    if (!steps || Number(steps) < 1 || Number(steps) > 200000) e.steps = 'Debe ser entre 1 y 200000 pasos';
    setErrors(p => ({ ...p, ...e }));
    if (Object.keys(e).length) return;
    const cal = Math.round(Number(steps) * 0.04);
    await api.createMovementEntry({
      description: '🚶 Pasos',
      caloriesBurned: cal,
      datetime: d + 'T' + new Date().toTimeString().slice(0, 5),
    });
    loadData();
    setSteps('');
    setErrors(p => ({ ...p, steps: '' }));
    setToast('Pasos guardados');
  };

  const daySteps = dayMovements
    .filter((m: any) => m.description === '🚶 Pasos')
    .reduce((s: number, m: any) => s + Math.round(m.caloriesBurned / 0.04), 0);

  const selectedFood = foods.find(f => f.id === selectedFoodId);
  const preview = selectedFood ? calcNutrients(selectedFood, Number(grams) || 0) : null;

  const totals = {
    calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0,
    caloriesBurned: dayMovements.reduce((s: number, m: any) => s + m.caloriesBurned, 0),
  };
  for (const e of dayEntries) {
    const f = foods.find(x => x.id === e.foodItemId);
    if (f) {
      const n = calcNutrients(f, e.grams);
      totals.calories += n.calories;
      totals.protein += n.protein;
      totals.fat += n.fat;
      totals.carbs += n.carbs;
      totals.fiber += n.fiber;
    }
  }

  const meals = groupByMeal(dayEntries).reverse();

  const balance = totals.calories - goal.calories - totals.caloriesBurned;
  const balanceColor = balance > 100 ? 'text-red-600' : balance < -100 ? 'text-green-600' : 'text-yellow-600';
  const balanceSymbol = balance > 0 ? '+' : balance < 0 ? '-' : '';

  const fmtTime = (t: string) => {
    const [h, m] = t.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d.toLocaleTimeString(goal.locale || 'es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1">
        <span className={`text-3xl font-bold ${balanceColor}`}>
          {balanceSymbol} {fmt(Math.abs(balance))} kcal
        </span>
        <div className="flex items-center gap-2 self-start">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">&larr;</button>
          <h2 className="text-xl font-bold">{formatDateShort(d)}</h2>
        </div>
      </div>

      <MacroSummary totals={totals} goal={goal} date={d} />

      <DailyAnalysis totals={totals} goal={goal} wentToGym={workoutData.wentToGym} bodyParts={workoutData.bodyParts || []} steps={daySteps} />

      <WeightSection date={d} />

      <div className="md:grid md:grid-cols-[1fr_2fr] md:gap-4">
        <ReferenciaPesos />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold mb-3">Agregar alimento</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <div ref={searchRef} className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={foodSearch}
              onChange={e => { setFoodSearch(e.target.value); setShowFoodDropdown(true); setSelectedFoodId(''); setErrors(p => ({ ...p, food: '' })); }}
              onFocus={() => setShowFoodDropdown(true)}
              placeholder="🔍 Buscar alimento..."
              className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.food ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              onKeyDown={e => e.key === 'Escape' && setShowFoodDropdown(false)}
            />
            {showFoodDropdown && foodSearch && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredFoods.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
                ) : (
                  filteredFoods.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFood(f.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 transition-colors"
                    >
                      <span className="font-medium">{f.name}</span>
                      <span className="text-gray-400 ml-2">{f.caloriesPer100g} cal</span>
                    </button>
                  ))
                )}
              </div>
            )}
            {errors.food && <p className="text-red-500 text-xs mt-1">{errors.food}</p>}
          </div>
          <input
            type="number"
            value={grams}
            onChange={e => { setGrams(e.target.value); setErrors(p => ({ ...p, grams: '' })); }}
            placeholder="Gramos"
            className={`w-24 border rounded-lg px-3 py-2 text-sm ${errors.grams ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
          />
          <span className="text-sm text-gray-500 self-center">g</span>
          <button onClick={handleAddFood} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            + Añadir
          </button>
        </div>
        {preview && (
          <div className="text-xs text-gray-500 space-x-3">
            <span>🔥 {preview.calories} kcal</span>
            <span>🥩 {preview.protein}g prot</span>
            <span>🧈 {preview.fat}g grasas</span>
            <span>🍚 {preview.carbs}g carbs</span>
            <span>🌾 {preview.fiber}g fibra</span>
          </div>
        )}
      </div>
      </div>

      {dayEntries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-lg mb-3">🥘 Alimentos registrados</h3>
          <div className="space-y-4">
            {meals.map((meal, mi) => {
              const mealTotals = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
              for (const e of meal.entries) {
                const f = foods.find(x => x.id === e.foodItemId);
                if (f) {
                  const n = calcNutrients(f, e.grams);
                  mealTotals.calories += n.calories;
                  mealTotals.protein += n.protein;
                  mealTotals.fat += n.fat;
                  mealTotals.carbs += n.carbs;
                  mealTotals.fiber += n.fiber;
                }
              }
              return (
              <div key={mi}>
                <div className="text-base font-bold text-black mb-1">Comida {meals.length - mi} — {fmtTime(meal.time)}</div>
                <div className="space-y-2">
                  {meal.entries.map((e: any) => {
                    const f = foods.find(x => x.id === e.foodItemId);
                    if (!f) return null;
                    const n = calcNutrients(f, e.grams);
                    return (
                      <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-medium">{f.name}</span>
                          <span className="text-gray-400 ml-2">{e.grams}g</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 text-xs">
                          <span>{fmt(n.calories)}cal</span>
                          <span>{fmt(n.protein, 1)}g</span>
                          <span>{fmt(n.fat, 1)}g</span>
                          <span>{fmt(n.carbs, 1)}g</span>
                          <span>{fmt(n.fiber, 1)}g</span>
                          <button onClick={async () => { await api.deleteFoodEntry(e.id); loadData(); }} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-2 pt-1 border-t border-gray-200 flex gap-3 flex-wrap justify-center">
                  <span>🔥 {fmt(mealTotals.calories)} kcal</span>
                  <span>🥩 {fmt(mealTotals.protein, 1)}g prot</span>
                  <span>🧈 {fmt(mealTotals.fat, 1)}g grasas</span>
                  <span>🍚 {fmt(mealTotals.carbs, 1)}g carbs</span>
                  <span>🌾 {fmt(mealTotals.fiber, 1)}g fibra</span>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      <GymSection date={d} onSaved={() => { loadData(); setToast('Entrenamiento guardado'); }} />

      <div className="md:grid md:grid-cols-2 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-3">🔥 Cardio y pasos</h3>
          <div className="flex flex-wrap gap-2 mb-1">
            <div className="flex-1 min-w-[180px]">
              <input
                type="text"
                value={movementDesc}
                onChange={e => { setMovementDesc(e.target.value); setErrors(p => ({ ...p, movementDesc: '' })); }}
                placeholder="Ej: Correr 30min"
                className={`w-full border rounded-lg px-3 py-2 text-sm ${errors.movementDesc ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.movementDesc && <p className="text-red-500 text-xs mt-1">{errors.movementDesc}</p>}
            </div>
            <div>
              <input
                type="number"
                value={movementCal}
                onChange={e => { setMovementCal(e.target.value); setErrors(p => ({ ...p, movementCal: '' })); }}
                placeholder="Calorías"
                className={`w-24 border rounded-lg px-3 py-2 text-sm ${errors.movementCal ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.movementCal && <p className="text-red-500 text-xs mt-1">{errors.movementCal}</p>}
            </div>
            <button onClick={handleAddMovement} className="bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors self-start">
              + Añadir
            </button>
          </div>
          <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">🚶 Pasos Apple Watch:</span>
            <div>
              <input
                type="number"
                value={steps}
                onChange={e => { setSteps(e.target.value); setErrors(p => ({ ...p, steps: '' })); }}
                placeholder="Ej: 8500"
                className={`w-28 border rounded-lg px-3 py-2 text-sm ${errors.steps ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                onKeyDown={e => e.key === 'Enter' && handleAddSteps()}
              />
              {errors.steps && <p className="text-red-500 text-xs mt-1">{errors.steps}</p>}
            </div>
            <button onClick={handleAddSteps} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Guardar
            </button>
          </div>
        </div>

        {dayMovements.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold mb-3">Ejercicio registrado</h3>
          <div className="space-y-2">
            {dayMovements.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                <span className="font-medium">{m.description}</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-medium">{m.caloriesBurned} kcal</span>
                  <button onClick={async () => { await api.deleteMovementEntry(m.id); loadData(); }} className="text-red-400 hover:text-red-600">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {toast && <Toast message={toast} onClose={closeToast} />}
    </div>
  );
}
