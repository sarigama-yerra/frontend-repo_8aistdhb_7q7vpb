import { useEffect, useState } from 'react'

function StatCard({ title, value, sub }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-2xl font-semibold text-slate-100 mt-1">{value}</div>
      {sub && <div className={`text-xs mt-1 ${String(sub).includes('-') ? 'text-red-400' : 'text-emerald-400'}`}>{sub}</div>}
    </div>
  )
}

function Bar({ v }) {
  const up = v >= 0
  return (
    <div className="h-40 w-1 relative">
      <div className={`absolute bottom-1 left-0 right-0 ${up ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{height: `${Math.min(100, Math.abs(v)*5)}%`, top: up ? `${50-Math.min(50, Math.abs(v)*2)}%` : '50%'}}></div>
    </div>
  )
}

export default function Dashboard({ timeframe }) {
  const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [kpis, setKpis] = useState(null)
  const [secondary, setSecondary] = useState(null)
  const [series, setSeries] = useState([])

  const load = async () => {
    const a = await fetch(`${BASE}/api/dashboard/summary?timeframe=${encodeURIComponent(timeframe)}`).then(r=>r.json())
    setKpis(a.kpis)
    setSecondary(a.secondary)
    const b = await fetch(`${BASE}/api/dashboard/live-pnl?points=80`).then(r=>r.json())
    setSeries(b.series)
  }

  useEffect(()=>{ load() }, [timeframe])

  return (
    <div className="p-6 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue (SOL)" value={kpis ? kpis.total_revenue_sol : '…'} sub={kpis ? `${kpis.total_revenue_change_pct}% vs prev` : null} />
        <StatCard title="Active Positions" value={kpis ? kpis.active_positions : '…'} sub={kpis ? `${kpis.active_positions_change_pct}% vs prev` : null} />
        <StatCard title="Closed Positions" value={kpis ? kpis.closed_positions : '…'} sub={kpis ? `${kpis.closed_positions_change_pct}% vs prev` : null} />
        <StatCard title="Win Rate" value={kpis ? `${kpis.win_rate_pct}%` : '…'} sub={kpis ? `Avg perf ${kpis.avg_performance_pct}%` : null} />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Last Hour PnL" value={secondary ? secondary.last_hour_pnl : '…'} />
        <StatCard title="At Risk" value={secondary ? secondary.at_risk : '…'} />
        <StatCard title="Players In" value={secondary ? `${secondary.players_in.count}` : '…'} sub={secondary ? `${secondary.players_in.pct}%` : null} />
        <StatCard title="Concentration" value={secondary ? secondary.concentration : '…'} />
        <StatCard title="Best Active" value={secondary ? `${secondary.best_asset.token}` : '…'} sub={secondary ? `${secondary.best_asset.pct}%` : null} />
        <StatCard title="Worst Active" value={secondary ? `${secondary.worst_asset.token}` : '…'} sub={secondary ? `${secondary.worst_asset.pct}%` : null} />
      </div>

      {/* Live PnL chart */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <div className="text-slate-200 font-semibold mb-2">Live PnL</div>
        <div className="h-48 flex items-end gap-1 overflow-hidden">
          {series.map((p,i)=> <Bar key={i} v={p.v} />)}
        </div>
      </div>
    </div>
  )
}
