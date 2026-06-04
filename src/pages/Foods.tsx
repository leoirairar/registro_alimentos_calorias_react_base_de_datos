import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function Foods() {
  const [foods, setFoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', caloriesPer100g: '', proteinPer100g: '', fatPer100g: '', carbsPer100g: '' });

  const refresh = () => api.getFoods().then(setFoods);
  useEffect(() => { refresh(); }, []);

  const resetForm = () => {
    setForm({ name: '', caloriesPer100g: '', proteinPer100g: '', fatPer100g: '', carbsPer100g: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.caloriesPer100g) return;
    const data = {
      name: form.name,
      caloriesPer100g: Number(form.caloriesPer100g),
      proteinPer100g: Number(form.proteinPer100g) || 0,
      fatPer100g: Number(form.fatPer100g) || 0,
      carbsPer100g: Number(form.carbsPer100g) || 0,
    };
    if (editingId) {
      await api.updateFood(editingId, data);
    } else {
      await api.createFood(data);
    }
    refresh();
    resetForm();
  };

  const handleEdit = (f: any) => {
    setForm({
      name: f.name,
      caloriesPer100g: String(f.caloriesPer100g),
      proteinPer100g: String(f.proteinPer100g),
      fatPer100g: String(f.fatPer100g),
      carbsPer100g: String(f.carbsPer100g),
    });
    setEditingId(f.id);
    setShowForm(true);
  };

  const liClass = (idx: number, arr: any[]) =>
    `flex items-center justify-between py-3 ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`;

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Alimentos</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold">{editingId ? 'Editar' : 'Nuevo'} alimento</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre"
              className="col-span-2 sm:col-span-5 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <div>
              <label className="text-xs text-gray-500">Calorías (100g)</label>
              <input
                type="number"
                value={form.caloriesPer100g}
                onChange={e => setForm({ ...form, caloriesPer100g: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Proteínas (100g)</label>
              <input
                type="number"
                step="0.1"
                value={form.proteinPer100g}
                onChange={e => setForm({ ...form, proteinPer100g: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Grasas (100g)</label>
              <input
                type="number"
                step="0.1"
                value={form.fatPer100g}
                onChange={e => setForm({ ...form, fatPer100g: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Carbohidratos (100g)</label>
              <input
                type="number"
                step="0.1"
                value={form.carbsPer100g}
                onChange={e => setForm({ ...form, carbsPer100g: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              {editingId ? 'Guardar cambios' : 'Crear alimento'}
            </button>
            <button onClick={resetForm} className="text-gray-500 px-4 py-2 text-sm hover:text-gray-700">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar alimento..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
        />
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            {foods.length === 0 ? 'No hay alimentos registrados. ¡Crea uno!' : 'Sin resultados'}
          </p>
        ) : (
          <div>
            {filtered.map((f: any, idx: number) => (
              <div key={f.id} className={liClass(idx, filtered)}>
                <div>
                  <div className="font-medium text-sm">{f.name}</div>
                  <div className="text-xs text-gray-400">
                    {f.caloriesPer100g} cal · {f.proteinPer100g}g prot · {f.fatPer100g}g grasas · {f.carbsPer100g}g carbs /100g
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(f)} className="text-gray-400 hover:text-emerald-600 text-xs px-2 py-1">Editar</button>
                  <button onClick={async () => { await api.deleteFood(f.id); refresh(); }} className="text-gray-400 hover:text-red-600 text-xs px-2 py-1">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
