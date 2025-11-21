import { useEffect, useState } from 'react'

function Table({ title, items }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <div className="text-slate-200 font-semibold mb-2">{title}</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="text-left px-3 py-2">Strategy</th>
              <th className="text-left px-3 py-2">Positions</th>
              <th className="text-left px-3 py-2">Total PnL (SOL)</th>
              <th className="text-left px-3 py-2">Avg %</th>
              <th className="text-left px-3 py-2">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {items.map((r,i)=> (
              <tr key={i} className="text-slate-200">
                <td className="px-3 py-2">{r.strategy}</td>
                <td className="px-3 py-2">{r.positions}</td>
                <td className={`px-3 py-2 ${r.total_pnl_sol>=0?'text-emerald-400':'text-rose-400'}`}>{r.total_pnl_sol}</td>
                <td className={`px-3 py-2 ${r.avg_pct>=0?'text-emerald-400':'text-rose-400'}`}>{r.avg_pct}%</td>
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
      <div className="flex-1 h-3 bg-slate-700 rounded overflow-hidden">
        <div className={`${pos?'bg-emerald-500':'bg-rose-500'} h-3`} style={{width: `${width}%`}}></div>
      </div>
      <div className={`w-16 text-right text-xs ${pos?'text-emerald-400':'text-rose-400'}`}>{v} SOL</div>
    </div>
  )
}

export default function StrategyAnalytics({ timeframe }) {
  const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [best, setBest] = useState({ items: [] })
  const [worst, setWorst] = useState({ items: [] })
  const [bars, setBars] = useState({ bars: [] })

  const load = async () => {
    const a = await fetch(`${BASE}/api/strategies/best`).then(r=>r.json())
    const b = await fetch(`${BASE}/api/strategies/worst`).then(r=>r.json())
    const c = await fetch(`${BASE}/api/performance/tokens?timeframe=${encodeURIComponent(timeframe)}`).then(r=>r.json())
    setBest(a); setWorst(b); setBars(c)
  }

  useEffect(()=>{ load() }, [timeframe])

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Table title="Best Strategies" items={best.items} />
        <Table title="Worst Strategies" items={worst.items} />
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <div className="text-slate-200 font-semibold mb-3">Token Performance ({bars.timeframe})</div>
        <div className="space-y-2">
          {bars.bars.map((b,i)=> <TokenBar key={i} label={b.token} v={b.pnl_sol} />)}
        </div>
      </div>
    </div>
  )
}
