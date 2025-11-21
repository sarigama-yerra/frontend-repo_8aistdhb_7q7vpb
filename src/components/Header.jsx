import { useEffect, useState } from 'react'
import { Bell, RefreshCw, SunMedium, Moon, ChevronDown, Clock } from 'lucide-react'

export default function Header({ timeframe, setTimeframe, onRefresh, theme, setTheme }) {
  const [nowLocal, setNowLocal] = useState('')
  const [nowUTC, setNowUTC] = useState('')

  useEffect(() => {
    const fmt = (d) => d.toLocaleString()
    const tick = () => {
      const d = new Date()
      setNowLocal(fmt(d))
      setNowUTC(d.toUTCString())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800 ml-72">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-300">
          <div className="flex items-center gap-2"><Clock size={16}/> <span className="hidden md:inline">Local:</span> {nowLocal}</div>
          <div className="hidden lg:flex items-center gap-2 opacity-80"><Clock size={16}/> <span>UTC:</span> {nowUTC}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={timeframe} onChange={(e)=>setTimeframe(e.target.value)} className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2">
              <option>Today</option>
              <option>24h</option>
              <option>3d</option>
              <option>7d</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-2 top-2.5 text-slate-400" />
          </div>

          <button onClick={onRefresh} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded-lg">
            <RefreshCw size={16}/> Refresh
          </button>

          <button onClick={toggleTheme} className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">
            {theme === 'dark' ? <SunMedium size={18}/> : <Moon size={18}/>}
          </button>

          <button className="relative p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="ml-2">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2">
              <img src={`https://api.dicebear.com/8.x/thumbs/svg?seed=bot`} alt="user" className="w-5 h-5 rounded"/>
              <span>ops@bots</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
