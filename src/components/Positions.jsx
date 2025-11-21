import { useEffect, useState } from 'react'

function StatusDot({ on }) {
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${on ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
}

function Table({ columns, rows, renderRow }) {
  return (
    <div className="overflow-auto bg-slate-800/60 border border-slate-700 rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            {columns.map((c,i)=> <th key={i} className="text-left px-3 py-2 whitespace-nowrap font-medium">{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {rows.map((r,i)=> renderRow(r,i))}
        </tbody>
      </table>
    </div>
  )
}

export default function Positions() {
  const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [open, setOpen] = useState({ summary:{}, rows: [] })
  const [closed, setClosed] = useState({ rows: [] })
  const [tokens, setTokens] = useState({ items: [] })
  const [strategies, setStrategies] = useState({ items: [] })

  const load = async () => {
    const a = await fetch(`${BASE}/api/positions/open`).then(r=>r.json())
    const b = await fetch(`${BASE}/api/positions/closed`).then(r=>r.json())
    const c = await fetch(`${BASE}/api/concentration/tokens`).then(r=>r.json())
    const d = await fetch(`${BASE}/api/deployment/strategies`).then(r=>r.json())
    setOpen(a); setClosed(b); setTokens(c); setStrategies(d)
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Open positions with header summary */}
      <div className="space-y-3">
        <div className="flex gap-3 text-xs">
          {['searching','in_position','managing','exiting'].map(k=> (
            <div key={k} className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">{k.replace('_',' ')}: <span className="text-slate-100 font-semibold">{open.summary?.[k] ?? '…'}</span></div>
          ))}
        </div>

        <Table 
          columns={[ 'Player', 'Status', 'Token', 'Strategy', 'Time in Position', 'PnL (SOL)', 'PnL (%)', 'Entered' ]}
          rows={open.rows}
          renderRow={(r,i)=> (
            <tr key={i} className="text-slate-200">
              <td className="px-3 py-2 whitespace-nowrap"><StatusDot on={r.connected} />{r.player}</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.status}</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.token}</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.strategy}</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.time_in_position}m</td>
              <td className={`px-3 py-2 whitespace-nowrap ${r.pnl_sol>=0?'text-emerald-400':'text-rose-400'}`}>{r.pnl_sol}</td>
              <td className={`px-3 py-2 whitespace-nowrap ${r.pnl_pct>=0?'text-emerald-400':'text-rose-400'}`}>{r.pnl_pct}%</td>
              <td className="px-3 py-2 whitespace-nowrap">{new Date(r.entered_at).toLocaleString()}</td>
            </tr>
          )}
        />
      </div>

      {/* Closed positions */}
      <div className="space-y-3">
        <div className="text-slate-200 font-semibold">Closed Positions</div>
        <Table 
          columns={[ 'Player/Team', 'Token', 'Strategy', 'Final PnL (SOL)', 'Final PnL (%)', 'Duration', 'Closed' ]}
          rows={closed.rows}
          renderRow={(r,i)=> (
            <tr key={i} className="text-slate-200">
              <td className="px-3 py-2 whitespace-nowrap">{r.player} / <span className="text-slate-400">{r.team}</span></td>
              <td className="px-3 py-2 whitespace-nowrap">{r.token}</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.strategy}</td>
              <td className={`px-3 py-2 whitespace-nowrap ${r.pnl_sol>=0?'text-emerald-400':'text-rose-400'}`}>{r.pnl_sol}</td>
              <td className={`px-3 py-2 whitespace-nowrap ${r.pnl_pct>=0?'text-emerald-400':'text-rose-400'}`}>{r.pnl_pct}%</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.duration_min}m</td>
              <td className="px-3 py-2 whitespace-nowrap">{new Date(r.closed_at).toLocaleString()}</td>
            </tr>
          )}
        />
      </div>

      {/* Concentration & Deployment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-200 font-semibold mb-2">Token Concentration</div>
          <div className="space-y-2">
            {tokens.items.map((it,i)=> (
              <div key={i} className="flex items-center justify-between text-slate-200 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs">{it.token}</div>
                  <div className="text-slate-300 text-sm">Pools: <span className="text-slate-100">{it.pools}</span></div>
                  <div className="text-slate-300 text-sm">Risk: <span className="text-slate-100">{it.risk}</span></div>
                </div>
                <div className={`${it.pnl_sol>=0?'text-emerald-400':'text-rose-400'} text-sm`}>{it.pnl_sol} SOL</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div className="text-slate-200 font-semibold mb-2">Strategy Deployment</div>
          <div className="space-y-2">
            {strategies.items.map((it,i)=> (
              <div key={i} className="flex items-center justify-between text-slate-200 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2">
                <div className="flex items-center gap-4">
                  <div className="text-slate-100 font-medium">{it.strategy} <span className="text-slate-400">{it.version}</span></div>
                  <div className="text-slate-300 text-sm">Players: <span className="text-slate-100">{it.players}</span></div>
                  <div className="text-slate-300 text-sm">Opened: <span className="text-slate-100">{it.positions_opened}</span></div>
                </div>
                <div className={`${it.pnl_sol>=0?'text-emerald-400':'text-rose-400'} text-sm`}>{it.pnl_sol} SOL</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
