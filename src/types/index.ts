export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
}

export interface FoodEntry {
  id: string;
  foodItemId: string;
  grams: number;
  datetime: string;
}

export interface MovementEntry {
  id: string;
  description: string;
  caloriesBurned: number;
  datetime: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  caloriesBurned: number;
}

export interface DailyGoal {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const DEFAULT_GOAL: DailyGoal = {
  calories: 2000,
  protein: 150,
  fat: 65,
  carbs: 200,
};
