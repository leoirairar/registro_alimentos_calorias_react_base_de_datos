export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  fiberPer100g: number;
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
  fiber: number;
  caloriesBurned: number;
}

export interface DailyGoal {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  heightCm?: number;
  age?: number;
  gender?: 'male' | 'female';
  initialWeightKg?: number | null;
  locale?: string;
}

export const DEFAULT_GOAL: DailyGoal = {
  calories: 2000,
  protein: 150,
  fat: 65,
  carbs: 200,
  fiber: 25,
  heightCm: 170,
  age: 30,
  gender: 'male',
  initialWeightKg: null,
  locale: 'es-CL',
};

export const COUNTRIES: { code: string; name: string; locale: string }[] = [
  { code: 'CL', name: 'Chile', locale: 'es-CL' },
  { code: 'AR', name: 'Argentina', locale: 'es-AR' },
  { code: 'MX', name: 'México', locale: 'es-MX' },
  { code: 'ES', name: 'España', locale: 'es-ES' },
  { code: 'CO', name: 'Colombia', locale: 'es-CO' },
  { code: 'PE', name: 'Perú', locale: 'es-PE' },
  { code: 'US', name: 'Estados Unidos', locale: 'en-US' },
  { code: 'GB', name: 'Reino Unido', locale: 'en-GB' },
  { code: 'BR', name: 'Brasil', locale: 'pt-BR' },
];
