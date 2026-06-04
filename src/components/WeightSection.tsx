import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

interface Props {
  date: string;
}

export default function WeightSection({ date }: Props) {
  const [weight, setWeight] = useState('');
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getWeight(date).then(w => {
      if (w?.weightKg) {
        setWeight(String(w.weightKg));
        setSaved(true);
      }
    });
  }, [date]);

  const handleSave = async () => {
    if (!weight) return;
    await api.saveWeight(date, { weightKg: parseFloat(weight) });
    setSaved(true);
    inputRef.current?.blur();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">⚖️ Peso en ayuno</h3>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          step="0.1"
          value={weight}
          onChange={e => { setWeight(e.target.value); setSaved(false); }}
          placeholder="Ej: 75.5"
          className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <span className="text-sm text-gray-500">kg</span>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            saved
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {saved ? '✔ Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
