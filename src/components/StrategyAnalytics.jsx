import { useEffect, useState } from 'react'

function Table({ title, items }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="text-slate-200 font-semibold mb-2">{title}</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="text-left px-3 py-2">Strategy</th>
              <th className="text-left px-3 py-2">Positions</th>
              <th className="text-left px-3 py-2">Total PnL (SOL)</th>
              <th className="text-left px-3 py-2">Avg %</th>
              <th className="text-left px-3 py-2">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {items.map((r,i)=> (
              <tr key={i} className="text-slate-200">
                <td className="px-3 py-2">{r.strategy}</td>
                <td className="px-3 py-2">{r.positions}</td>
                <td className={`${r.total_pnl_sol>=0?'text-emerald-400':'text-rose-400'} px-3 py-2 font-mono tabular-nums`}>{r.total_pnl_sol}</td>
                <td className={`${r.avg_pct>=0?'text-emerald-400':'text-rose-400'} px-3 py-2 font-mono tabular-nums`}>{r.avg_pct}%</td>
                <td className="px-3 py-2">{r.win_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TokenBar({ label, v }) {
  const pos = v >= 0
  const width = Math.min(100, Math.abs(v))
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-slate-300 text-xs">{label}</div>
      <div className="flex-1 h-3 bg-slate-800 rounded overflow-hidden">
        <div className={`${pos?'bg-emerald-500':'bg-rose-500'} h-3`} style={{width: `${width}%`}}></div>
      </div>
      <div className={`w-16 text-right text-xs ${pos?'text-emerald-400':'text-rose-400'} font-mono tabular-nums`}>{v} SOL</div>
    </div>
  )
}

export default function StrategyAnalytics({ timeframe }) {
  const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [best, setBest] = useState({ items: [] })
  const [worst, setWorst] = useState({ items: [] })
  const [bars, setBars] = useState({ bars: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [a,b,c] = await Promise.all([
        fetch(`${BASE}/api/strategies/best`).then(r=>r.json()),
        fetch(`${BASE}/api/strategies/worst`).then(r=>r.json()),
        fetch(`${BASE}/api/performance/tokens?timeframe=${encodeURIComponent(timeframe)}`).then(r=>r.json())
      ])
      setBest(a); setWorst(b); setBars(c)
    } catch (e) {
      setError('Failed to load')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ load() }, [timeframe])

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Table title="Best Strategies" items={best.items} />
        <Table title="Worst Strategies" items={worst.items} />
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-200 font-semibold">Token Performance ({bars.timeframe})</div>
          {error && <div className="text-xs text-rose-300">{error}</div>}
        </div>
        <div className="space-y-2">
          {loading ? (
            <div className="text-slate-400 text-sm">Loading…</div>
          ) : (
            bars.bars.map((b,i)=> <TokenBar key={i} label={b.token} v={b.pnl_sol} />)
          )}
        </div>
      </div>
    </div>
  )
}
