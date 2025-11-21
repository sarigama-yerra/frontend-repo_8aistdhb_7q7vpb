import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Positions from './components/Positions'
import StrategyAnalytics from './components/StrategyAnalytics'
import Monitor from './components/Monitor'

function Alerts() {
  const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [items, setItems] = useState([])
  useEffect(()=>{
    const load = async () => {
      try {
        const res = await fetch(`${BASE}/api/alerts`).then(r=>r.json())
        if (res.items && res.items.length) setItems(res.items)
      } catch {}
    }
    load()
    const id = setInterval(load, 7000)
    const ttl = setInterval(()=> setItems(prev => prev.slice(1)), 4000)
    return ()=>{ clearInterval(id); clearInterval(ttl) }
  }, [])
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {items.map((a,i)=> (
        <div key={i} className={`px-4 py-2 rounded-lg shadow border ${a.level==='error'?'bg-rose-600/20 border-rose-700 text-rose-200': a.level==='warning' ? 'bg-amber-600/20 border-amber-700 text-amber-200' : 'bg-slate-800/80 border-slate-700 text-slate-200'}`}>
          <div className="text-sm">{a.message}</div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [timeframe, setTimeframe] = useState('Today')
  const [theme, setTheme] = useState('dark')
  const loc = useLocation()

  useEffect(()=>{
    document.documentElement.classList.toggle('dark', theme==='dark')
  }, [theme])

  const refresh = () => {
    // no-op; individual views refresh on param change
    setTimeframe(t=>t)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <Header timeframe={timeframe} setTimeframe={setTimeframe} onRefresh={refresh} theme={theme} setTheme={setTheme} />
      <main className="ml-72 pt-4">
        <Routes>
          <Route path="/" element={<Dashboard timeframe={timeframe} />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/analytics" element={<StrategyAnalytics timeframe={timeframe} />} />
          <Route path="/monitor" element={<Monitor />} />
        </Routes>
      </main>
      <Alerts />
    </div>
  )
}
