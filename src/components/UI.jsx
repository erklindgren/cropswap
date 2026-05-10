import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Toast notification ────────────────────────────────────────────────────────
export function Toast() {
  const { notification } = useApp();
  if (!notification) return null;
  const icons = { success: CheckCircle, warning: AlertTriangle, info: Info };
  const Icon = icons[notification.type] || CheckCircle;
  const colors = {
    success: 'bg-moss-600 text-white',
    warning: 'bg-clay-500 text-white',
    info:    'bg-stone-700 text-white',
  };
  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lift text-sm font-medium ${colors[notification.type] || colors.success}`}
      style={{ animation: 'fadeUp 0.2s ease both' }}>
      <Icon size={16} />
      {notification.msg}
    </div>
  );
}

// ── Credit badge ──────────────────────────────────────────────────────────────
export function CreditBadge({ amount, size = 'md' }) {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1', lg: 'text-base px-3 py-1.5' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-moss-50 text-moss-700 border border-moss-100 ${sizes[size]}`}>
      <span className="font-mono">{amount}</span>
      <span className="text-moss-500 font-normal">cr</span>
    </span>
  );
}

// ── Tier badge ────────────────────────────────────────────────────────────────
export function TierBadge({ tier }) {
  const map = {
    1: { label: 'T1 · Standard',      cls: 'tag-t1' },
    2: { label: 'T2 · Premium',       cls: 'tag-t2' },
    3: { label: 'T3 · Artisan',       cls: 'tag-t3' },
  };
  const { label, cls } = map[tier] || map[1];
  return <span className={`tag ${cls}`}>{label}</span>;
}

// ── Freshness indicator ───────────────────────────────────────────────────────
export function FreshnessDot({ bestBy }) {
  const days = Math.ceil((new Date(bestBy) - new Date()) / 86400000);
  const color = days > 5 ? 'bg-moss-400' : days > 2 ? 'bg-yellow-400' : 'bg-red-400';
  const label = days > 5 ? `${days}d` : days > 2 ? `${days}d` : days <= 0 ? 'Today' : `${days}d`;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

// ── Trust tier pill ───────────────────────────────────────────────────────────
export function TrustPill({ tier }) {
  const colors = {
    Seedling: 'bg-moss-50 text-moss-600',
    Grower:   'bg-moss-100 text-moss-700',
    Steward:  'bg-moss-200 text-moss-800',
    Elder:    'bg-moss-700 text-white',
  };
  return (
    <span className={`tag ${colors[tier] || colors.Seedling}`}>{tier}</span>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4" style={{ animation: 'fadeUp 0.15s ease both' }}>
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-lift w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-display text-xl text-stone-800">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ emoji, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <div className="font-display text-xl text-stone-700 mb-2">{title}</div>
      {body && <div className="text-stone-400 text-sm max-w-xs">{body}</div>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h1 className="font-display text-2xl text-stone-800">{title}</h1>
        {subtitle && <p className="text-stone-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = 'text-stone-800' }) {
  return (
    <div className="card p-4">
      <div className={`font-display text-3xl font-medium ${color}`}>{value}</div>
      <div className="text-stone-500 text-xs mt-0.5 font-medium uppercase tracking-wide">{label}</div>
      {sub && <div className="text-stone-400 text-xs mt-1">{sub}</div>}
    </div>
  );
}

// ── Reserve health bar ────────────────────────────────────────────────────────
export function ReserveBar({ balance, donated }) {
  const pct = donated > 0 ? Math.min(100, Math.round((balance / donated) * 100)) : 0;
  const color = pct > 50 ? 'bg-moss-500' : pct > 25 ? 'bg-yellow-400' : 'bg-clay-400';
  return (
    <div>
      <div className="flex justify-between text-xs text-stone-500 mb-1.5">
        <span>Community Reserve</span>
        <span className="font-mono">{balance} cr available</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
