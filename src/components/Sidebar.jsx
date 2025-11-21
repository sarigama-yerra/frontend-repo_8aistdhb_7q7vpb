import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LineChart, FlaskConical, Bot, Bell, User, Users, Shield, Wallet, Layers3, Table2, Settings, Boxes, Rocket, Wrench } from 'lucide-react'

const Section = ({ title, children }) => (
  <div className="mt-6">
    <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
)

const Item = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-500/15 text-blue-300' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
)

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-68 md:w-72 bg-slate-900/80 backdrop-blur border-r border-slate-800 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 px-2 mb-4">
        <Bot className="text-blue-400" />
        <div>
          <div className="text-slate-200 font-semibold leading-tight">Bots Monitor</div>
          <div className="text-xs text-slate-500">Crypto Automation</div>
        </div>
      </div>

      <Section title="Main">
        <Item to="/" icon={LayoutDashboard} label="Dashboard" />
        <Item to="/positions" icon={Table2} label="Positions & Deployment" />
        <Item to="/analytics" icon={LineChart} label="Strategy Performance" />
        <Item to="/monitor" icon={FlaskConical} label="Live Monitoring" />
      </Section>

      <Section title="Strategy">
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Wrench size={16}/>Performance</div>
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Rocket size={16}/>Playground</div>
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Bot size={16}/>LLM Consultation</div>
      </Section>

      <Section title="Profile">
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Bell size={16}/>Notifications</div>
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Users size={16}/>Delegations</div>
      </Section>

      <Section title="Admin">
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Users size={16}/>Players</div>
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Wallet size={16}/>Wallets</div>
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Layers3 size={16}/>Position Insights</div>
      </Section>

      <Section title="Management">
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><User size={16}/>Users</div>
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Shield size={16}/>Invites</div>
      </Section>

      <Section title="Development">
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Boxes size={16}/>SDK</div>
        <div className="px-3 text-slate-400 text-sm flex items-center gap-2"><Settings size={16}/>Settings</div>
      </Section>
    </aside>
  )
}
