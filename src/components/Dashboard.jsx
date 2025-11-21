import { useEffect, useMemo, useState } from 'react'

function StatCard({ title, value, sub, loading, error }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="text-slate-400 text-xs tracking-wide">{title}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-slate-100 font-mono tabular-nums">
          {loading ? '…' : error ? '—' : value}
        </div>
        {sub && (
          <div className={`text-[11px] px-1.5 py-0.5 rounded-md border ${String(sub).includes('-') ? 'text-rose-300 border-rose-700/60 bg-rose-950/40' : 'text-emerald-300 border-emerald-700/60 bg-emerald-950/30'}`}>{sub}</div>
        )}
      </div>
    </div>
  )
}

function PnlSparkline({ points }) {
  const width = 300
  const height = 80
  const padding = 4
  const values = points.map(p => p.v)
  const max = Math.max(1, ...values.map(v => Math.abs(v)))
  const stepX = (width - padding * 2) / Math.max(1, values.length - 1)
  const midY = height / 2
  const scaleY = (v) => midY - (v / max) * (height / 2 - 6)
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${padding + i * stepX} ${scaleY(v)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
      <rect x="0" y="0" width={width} height={height} rx="10" className="fill-slate-900/40" />
      <line x1="0" x2={width} y1={midY} y2={midY} className="stroke-slate-700/60" />
      <path d={path} className="fill-none stroke-slate-300" strokeWidth="1.5" />
      {values.map((v, i) => (
        <line key={i} x1={padding + i * stepX} x2={padding + i * stepX} y1={midY} y2={scaleY(v)} className={`${v>=0?'stroke-emerald-500/70':'stroke-rose-500/70'}`} />
      ))}
    </svg>
  )
}

export default function Dashboard({ timeframe }) {
  const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [kpis, setKpis] = useState(null)
  const [secondary, setSecondary] = useState(null)
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [a, b] = await Promise.all([
        fetch(`${BASE}/api/dashboard/summary?timeframe=${encodeURIComponent(timeframe)}`).then(r=>r.json()),
        fetch(`${BASE}/api/dashboard/live-pnl?points=120`).then(r=>r.json())
      ])
      setKpis(a.kpis)
      setSecondary(a.secondary)
      setSeries(b.series || [])
    } catch (e) {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [timeframe])

  const totalPnl = useMemo(()=> {
    const v = (secondary?.last_hour_pnl ?? 0)
    return v
  }, [secondary])

  return (
    <div className="p-6 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue (SOL)" value={kpis ? kpis.total_revenue_sol : ''} sub={kpis ? `${kpis.total_revenue_change_pct}% vs prev` : null} loading={loading} error={error} />
        <StatCard title="Active Positions" value={kpis ? kpis.active_positions : ''} sub={kpis ? `${kpis.active_positions_change_pct}% vs prev` : null} loading={loading} error={error} />
        <StatCard title="Closed Positions" value={kpis ? kpis.closed_positions : ''} sub={kpis ? `${kpis.closed_positions_change_pct}% vs prev` : null} loading={loading} error={error} />
        <StatCard title="Win Rate" value={kpis ? `${kpis.win_rate_pct}%` : ''} sub={kpis ? `Avg perf ${kpis.avg_performance_pct}%` : null} loading={loading} error={error} />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Last Hour PnL" value={secondary ? secondary.last_hour_pnl : ''} loading={loading} error={error} />
        <StatCard title="At Risk" value={secondary ? secondary.at_risk : ''} loading={loading} error={error} />
        <StatCard title="Players In" value={secondary ? `${secondary.players_in.count}` : ''} sub={secondary ? `${secondary.players_in.pct}%` : null} loading={loading} error={error} />
        <StatCard title="Concentration" value={secondary ? secondary.concentration : ''} loading={loading} error={error} />
        <StatCard title="Best Active" value={secondary ? `${secondary.best_asset.token}` : ''} sub={secondary ? `${secondary.best_asset.pct}%` : null} loading={loading} error={error} />
        <StatCard title="Worst Active" value={secondary ? `${secondary.worst_asset.token}` : ''} sub={secondary ? `${secondary.worst_asset.pct}%` : null} loading={loading} error={error} />
      </div>

      {/* Live PnL chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-slate-200 font-semibold">Live PnL</div>
          <div className={`text-xs font-mono tabular-nums ${totalPnl>=0? 'text-emerald-400' : 'text-rose-400'}`}>Last hr: {totalPnl}</div>
        </div>
        <div className="h-28">
          <PnlSparkline points={series} />
        </div>
        {error && (
          <div className="text-xs text-rose-300 mt-2">{error}</div>
        )}
      </div>
    </div>
  )
}
