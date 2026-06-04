import type { DailyGoal, DailyTotals, FoodEntry, FoodItem, MovementEntry } from '../types';

export function calcNutrients(foodItem: FoodItem, grams: number) {
  const factor = grams / 100;
  return {
    calories: Math.round(foodItem.caloriesPer100g * factor),
    protein: Math.round(foodItem.proteinPer100g * factor * 10) / 10,
    fat: Math.round(foodItem.fatPer100g * factor * 10) / 10,
    carbs: Math.round(foodItem.carbsPer100g * factor * 10) / 10,
  };
}

export function calcDailyTotals(
  dateStr: string,
  foodEntries: FoodEntry[],
  movementEntries: MovementEntry[],
  foods: FoodItem[],
): DailyTotals {
  const dayFoods = foodEntries.filter(e => e.datetime.startsWith(dateStr));
  const dayMovements = movementEntries.filter(e => e.datetime.startsWith(dateStr));

  const totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };

  for (const entry of dayFoods) {
    const food = foods.find(f => f.id === entry.foodItemId);
    if (food) {
      const n = calcNutrients(food, entry.grams);
      totals.calories += n.calories;
      totals.protein += n.protein;
      totals.fat += n.fat;
      totals.carbs += n.carbs;
    }
  }

  const caloriesBurned = dayMovements.reduce((s, m) => s + m.caloriesBurned, 0);

  return {
    ...totals,
    caloriesBurned,
  };
}

export function calcRemaining(totals: DailyTotals, goal: DailyGoal) {
  return {
    calories: goal.calories - totals.calories + totals.caloriesBurned,
    protein: Math.max(0, goal.protein - totals.protein),
    fat: Math.max(0, goal.fat - totals.fat),
    carbs: Math.max(0, goal.carbs - totals.carbs),
  };
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const last = new Date(year, month + 1, 0);
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function calcMacroPct(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
