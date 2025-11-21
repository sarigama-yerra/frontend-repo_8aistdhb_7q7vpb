import { useEffect, useState } from 'react'

function StatusBadge({ status }) {
  const map = {
    searching: 'bg-slate-900/60 border-slate-800 text-slate-300',
    in_position: 'bg-emerald-900/30 border-emerald-800 text-emerald-300',
    managing: 'bg-amber-900/30 border-amber-800 text-amber-300',
    exiting: 'bg-sky-900/30 border-sky-800 text-sky-300'
  }
  return <span className={`px-2 py-0.5 rounded-md border text-xs ${map[status] || 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>{String(status).replace('_',' ')}</span>
}

function StatusDot({ on }) {
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${on ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
}

function Table({ columns, rows, renderRow }) {
  return (
    <div className="overflow-auto bg-slate-900/60 border border-slate-800 rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            {columns.map((c,i)=> <th key={i} className="text-left px-3 py-2 whitespace-nowrap font-medium">{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [a,b,c,d] = await Promise.all([
        fetch(`${BASE}/api/positions/open`).then(r=>r.json()),
        fetch(`${BASE}/api/positions/closed`).then(r=>r.json()),
        fetch(`${BASE}/api/concentration/tokens`).then(r=>r.json()),
        fetch(`${BASE}/api/deployment/strategies`).then(r=>r.json())
      ])
      setOpen(a); setClosed(b); setTokens(c); setStrategies(d)
    } catch (e) {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Open positions with header summary */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3 text-xs">
          {['searching','in_position','managing','exiting'].map(k=> (
            <div key={k} className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-300">
              {k.replace('_',' ')}: <span className="text-slate-100 font-semibold">{open.summary?.[k] ?? (loading ? '…' : '0')}</span>
            </div>
          ))}
        </div>

        <Table 
          columns={[ 'Player', 'Status', 'Token', 'Strategy', 'Time in Position', 'PnL (SOL)', 'PnL (%)', 'Entered' ]}
          rows={open.rows}
          renderRow={(r,i)=> (
            <tr key={i} className="text-slate-200">
              <td className="px-3 py-2 whitespace-nowrap"><StatusDot on={r.connected} />{r.player}</td>
              <td className="px-3 py-2 whitespace-nowrap"><StatusBadge status={r.status} /></td>
              <td className="px-3 py-2 whitespace-nowrap">{r.token}</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.strategy}</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.time_in_position}m</td>
              <td className={`${r.pnl_sol>=0?'text-emerald-400':'text-rose-400'} px-3 py-2 whitespace-nowrap font-mono tabular-nums`}>{r.pnl_sol}</td>
              <td className={`${r.pnl_pct>=0?'text-emerald-400':'text-rose-400'} px-3 py-2 whitespace-nowrap font-mono tabular-nums`}>{r.pnl_pct}%</td>
              <td className="px-3 py-2 whitespace-nowrap">{new Date(r.entered_at).toLocaleString()}</td>
            </tr>
          )}
        />
        {error && <div className="text-xs text-rose-300">{error}</div>}
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
              <td className={`${r.pnl_sol>=0?'text-emerald-400':'text-rose-400'} px-3 py-2 whitespace-nowrap font-mono tabular-nums`}>{r.pnl_sol}</td>
              <td className={`${r.pnl_pct>=0?'text-emerald-400':'text-rose-400'} px-3 py-2 whitespace-nowrap font-mono tabular-nums`}>{r.pnl_pct}%</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.duration_min}m</td>
              <td className="px-3 py-2 whitespace-nowrap">{new Date(r.closed_at).toLocaleString()}</td>
            </tr>
          )}
        />
      </div>

      {/* Concentration & Deployment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-200 font-semibold mb-2">Token Concentration</div>
          <div className="space-y-2">
            {tokens.items.map((it,i)=> (
              <div key={i} className="flex items-center justify-between text-slate-200 bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">{it.token}</div>
                  <div className="text-slate-300 text-xs">Pools: <span className="text-slate-100">{it.pools}</span></div>
                  <div className="text-slate-300 text-xs">Risk: <span className="text-slate-100">{it.risk}</span></div>
                </div>
                <div className={`${it.pnl_sol>=0?'text-emerald-400':'text-rose-400'} text-sm font-mono tabular-nums`}>{it.pnl_sol} SOL</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-200 font-semibold mb-2">Strategy Deployment</div>
          <div className="space-y-2">
            {strategies.items.map((it,i)=> (
              <div key={i} className="flex items-center justify-between text-slate-200 bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
                <div className="flex items-center gap-4">
                  <div className="text-slate-100 font-medium">{it.strategy} <span className="text-slate-400">{it.version}</span></div>
                  <div className="text-slate-300 text-xs">Players: <span className="text-slate-100">{it.players}</span></div>
                  <div className="text-slate-300 text-xs">Opened: <span className="text-slate-100">{it.positions_opened}</span></div>
                </div>
                <div className={`${it.pnl_sol>=0?'text-emerald-400':'text-rose-400'} text-sm font-mono tabular-nums`}>{it.pnl_sol} SOL</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
