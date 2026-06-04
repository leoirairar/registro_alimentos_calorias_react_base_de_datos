import { useState, useEffect } from 'react';
import { api } from '../api/client';

const BODY_PARTS = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Piernas', 'Glúteos', 'Abdominales', 'Cardio',
];

interface Props {
  date: string;
  onSaved?: () => void;
}

export default function GymSection({ date, onSaved }: Props) {
  const [went, setWent] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    api.getWorkout(date).then(w => {
      setWent(w.wentToGym);
      setSelected(w.bodyParts || []);
      setNotes(w.notes || '');
      const exists = w.wentToGym || w.bodyParts?.length > 0 || w.notes;
      setHasData(exists);
      setLoaded(true);
    });
  }, [date]);

  const toggle = (part: string) => {
    setSelected(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    );
  };

  const handleSave = async () => {
    await api.saveWorkout(date, { wentToGym: went, bodyParts: selected, notes });
    setHasData(true);
    onSaved?.();
  };

  if (!loaded) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">🏋️ Gimnasio</h3>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className={`text-sm font-medium ${went ? 'text-emerald-600' : 'text-gray-500'}`}>
            {went ? '✅ Sí' : '¿Fuiste?'}
          </span>
          <input
            type="checkbox"
            checked={went}
            onChange={e => setWent(e.target.checked)}
            className="w-5 h-5 rounded accent-emerald-600"
          />
        </label>
      </div>

      {went && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {BODY_PARTS.map(part => (
              <button
                key={part}
                type="button"
                onClick={() => toggle(part)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selected.includes(part)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {part}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notas (ej: 3x12 press banca)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
          />
        </>
      )}

      <button
        onClick={handleSave}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          hasData
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {hasData ? 'Actualizar entrenamiento' : 'Guardar entrenamiento'}
      </button>
    </div>
  );
}
