import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DailyLog from './pages/DailyLog'
import Foods from './pages/Foods'
import Settings from './pages/Settings'
import Progreso from './pages/Progreso'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log/:date" element={<DailyLog />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/progreso" element={<Progreso />} />
      </Route>
    </Routes>
  )
}

export default App
