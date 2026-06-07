const porciones = [
    { alimento: 'Scoop protein', porcion: '1 unidad', gramos: 30 },
  { alimento: 'Queso fresco', porcion: '1 lámina', gramos: 30 },
  { alimento: 'Jamón', porcion: '1 lámina', gramos: 20 },
  { alimento: 'Maní japonés', porcion: '10 unidades', gramos: 15 },
  { alimento: 'Maní tostado', porcion: '10 unidades', gramos: 10 },
  { alimento: 'Tuto de pollo', porcion: '1 unidad', gramos: 100 },
  { alimento: 'Huevo mediano', porcion: '1 unidad', gramos: 50 },
];

export default function ReferenciaPesos() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold mb-2 text-sm">⚖️ Referencia de pesos</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-100">
            <th className="text-left py-1 font-medium">Alimento</th>
            <th className="text-left py-1 font-medium">Porción</th>
            <th className="text-right py-1 font-medium">Peso</th>
          </tr>
        </thead>
        <tbody>
          {porciones.map((p, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              <td className="py-1.5 font-medium text-gray-700">{p.alimento}</td>
              <td className="py-1.5 text-gray-500">{p.porcion}</td>
              <td className="py-1.5 text-right text-gray-700 font-medium">{p.gramos}g</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
