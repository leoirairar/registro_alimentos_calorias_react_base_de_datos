import { NavLink } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/foods', label: 'Alimentos', icon: '🥩' },
  { to: '/settings', label: 'Metas', icon: '⚙️' },
]

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-emerald-700">Registro de Alimento</h1>
        <nav className="flex gap-4">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium px-2 py-1 rounded transition-colors ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:text-emerald-700'
                }`
              }
            >
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
