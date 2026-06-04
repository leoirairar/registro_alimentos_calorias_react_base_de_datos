const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getFoods: () => request<any[]>('/foods'),
  createFood: (data: any) => request<any>('/foods', { method: 'POST', body: JSON.stringify(data) }),
  updateFood: (id: string, data: any) => request<any>(`/foods/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFood: (id: string) => request<any>(`/foods/${id}`, { method: 'DELETE' }),

  getFoodEntries: (date?: string) => request<any[]>(`/food-entries${date ? `?date=${date}` : ''}`),
  getFoodEntriesRange: (dateFrom: string, dateTo: string) =>
    request<any[]>(`/food-entries?dateFrom=${dateFrom}&dateTo=${dateTo}`),
  createFoodEntry: (data: any) => request<any>('/food-entries', { method: 'POST', body: JSON.stringify(data) }),
  deleteFoodEntry: (id: string) => request<any>(`/food-entries/${id}`, { method: 'DELETE' }),

  getMovementEntries: (date?: string) => request<any[]>(`/movement-entries${date ? `?date=${date}` : ''}`),
  getMovementEntriesRange: (dateFrom: string, dateTo: string) =>
    request<any[]>(`/movement-entries?dateFrom=${dateFrom}&dateTo=${dateTo}`),
  createMovementEntry: (data: any) => request<any>('/movement-entries', { method: 'POST', body: JSON.stringify(data) }),
  deleteMovementEntry: (id: string) => request<any>(`/movement-entries/${id}`, { method: 'DELETE' }),

  getGoal: () => request<any>('/goal'),
  updateGoal: (data: any) => request<any>('/goal', { method: 'PUT', body: JSON.stringify(data) }),

  getWorkoutsRange: (dateFrom: string, dateTo: string) =>
    request<any[]>(`/workouts?dateFrom=${dateFrom}&dateTo=${dateTo}`),
  getWorkout: (date: string) => request<any>(`/workout/${date}`),
  saveWorkout: (date: string, data: any) => request<any>(`/workout/${date}`, { method: 'PUT', body: JSON.stringify(data) }),

  getWeightsRange: (dateFrom: string, dateTo: string) =>
    request<any[]>(`/weights?dateFrom=${dateFrom}&dateTo=${dateTo}`),
  getWeight: (date: string) => request<any>(`/weight/${date}`),
  saveWeight: (date: string, data: any) => request<any>(`/weight/${date}`, { method: 'PUT', body: JSON.stringify(data) }),

  getMeasurementsRange: (dateFrom: string, dateTo: string) =>
    request<any[]>(`/measurements?dateFrom=${dateFrom}&dateTo=${dateTo}`),
  getMeasurement: (date: string) => request<any>(`/measurement/${date}`),
  saveMeasurement: (date: string, data: any) => request<any>(`/measurement/${date}`, { method: 'PUT', body: JSON.stringify(data) }),
};
