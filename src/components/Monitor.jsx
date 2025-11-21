import { useEffect, useState } from 'react'

function HourBar({ v }) {
  const pos = v >= 0
  const height = Math.min(100, Math.abs(v) * 4)
  return (
    <div className="w-2 h-40 relative">
      <div className={`absolute bottom-1 left-0 right-0 ${pos?'bg-emerald-500':'bg-rose-500'}`} style={{height: `${height}%`, top: pos ? `${50-height/2}%` : '50%'}}></div>
    </div>
  )
}

function FeedItem({ it }) {
  return (
    <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200">
      <div className="flex items-center gap-3">
        <div className="text-slate-400">#{it.id}</div>
        <div><span className="text-slate-100">{it.player}</span> {it.action} <span className="text-slate-400">{it.token}</span></div>
      </div>
      <div className="flex items-center gap-3">
        {it.pnl !== null && it.pnl !== undefined && (
          <div className={`${it.pnl>=0?'text-emerald-400':'text-rose-400'} font-mono tabular-nums`}>{it.pnl} SOL</div>
        )}
        <div className="text-slate-400">{new Date(it.timestamp).toLocaleString()}</div>
      </div>
    </div>
  )
}

export default function Monitor() {
  const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [overview, setOverview] = useState({ bars: [], stats: {} })
  const [feed, setFeed] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [a, b] = await Promise.all([
        fetch(`${BASE}/api/monitor/overview`).then(r=>r.json()),
        fetch(`${BASE}/api/feed?limit=50`).then(r=>r.json())
      ])
      setOverview(a); setFeed(b)
    } catch (e) {
      setError('Failed to load')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ load(); const id = setInterval(load, 5000); return ()=>clearInterval(id) }, [])

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-200 font-semibold">Hourly Overview</div>
            {error && <div className="text-xs text-rose-300">{error}</div>}
          </div>
          <div className="h-48 flex items-end gap-1 overflow-hidden">
            {overview.bars.map((b,i)=> <HourBar key={i} v={b.v} />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-slate-300">Net PnL <div className="text-slate-100 font-semibold font-mono tabular-nums">{overview.stats.net_pnl}</div></div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-slate-300">Total Positions <div className="text-slate-100 font-semibold">{overview.stats.total_positions}</div></div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-slate-300">Profitable Hours <div className="text-slate-100 font-semibold">{overview.stats.profitable_hours}</div></div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-slate-300">Avg / Hour <div className="text-slate-100 font-semibold font-mono tabular-nums">{overview.stats.avg_per_hour}</div></div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-slate-200 font-semibold mb-1">Live Activity Feed</div>
        <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
          {loading ? (
            <div className="text-slate-400 text-sm">Loading…</div>
          ) : (
            feed.items.map((it,i)=> <FeedItem key={i} it={it} />)
          )}
        </div>
      </div>
    </div>
  )
}
