interface Props {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
  dayData: Record<string, { netCalories: number; goalCalories: number; wentToGym?: boolean; weight?: number }>;
  selectedDate?: string;
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

export default function Calendar({ year, month, onPrevMonth, onNextMonth, onDayClick, dayData, selectedDate }: Props) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const days: (number | null)[] = Array(startDay).fill(null);

  for (let d = 1; d <= last.getDate(); d++) {
    days.push(d);
  }

  const fmt = (d: number) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg">&larr;</button>
        <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
        <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg">&rarr;</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
        {DAY_NAMES.map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} />;
          const ds = fmt(d);
          const info = dayData[ds];
          const isSelected = ds === selectedDate;
          const isToday = ds === new Date().toISOString().slice(0, 10);
          const pct = info ? Math.round((info.netCalories / info.goalCalories) * 100) : 0;

          return (
            <button
              key={ds}
              onClick={() => onDayClick(ds)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-lg text-sm transition-colors h-16 ${
                isSelected
                  ? 'bg-emerald-100 ring-2 ring-emerald-500'
                  : isToday
                    ? 'bg-emerald-50'
                    : 'hover:bg-gray-100'
              }`}
            >
              <span className={`font-medium leading-tight ${isToday ? 'text-emerald-700' : ''}`}>{d}</span>
              {info?.wentToGym && <span className="text-[10px] leading-none">🏋️</span>}
              {info?.weight && <span className="text-[9px] text-gray-500 leading-none">{info.weight}kg</span>}
              {info !== undefined && (
                <span className={`text-[9px] leading-none ${pct > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                  {info.netCalories}
                </span>
              )}
              {info !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${pct > 100 ? 'bg-red-400' : pct > 50 ? 'bg-emerald-400' : 'bg-yellow-400'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
