import { ArrowUpRight, ArrowDownLeft, Gift, TrendingUp } from 'lucide-react';
import { SectionHeader, StatCard, ReserveBar, Empty } from '../components/UI';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

function TxRow({ tx }) {
  const isCredit = tx.amount > 0;
  const isGrant  = tx.tx_type === 'welcome_grant' || tx.tx_type === 'moderator_grant';
  const Icon  = isGrant ? Gift : isCredit ? ArrowUpRight : ArrowDownLeft;
  const color = isGrant ? 'text-soil-500' : isCredit ? 'text-moss-600' : 'text-clay-600';
  const bg    = isGrant ? 'bg-soil-50'   : isCredit ? 'bg-moss-50'   : 'bg-clay-50';
  const sign  = isCredit ? '+' : '−';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-50 last:border-0">
      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={14} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-stone-700 leading-snug">{tx.note || tx.tx_type}</div>
        <div className="text-xs text-stone-400 mt-0.5">
          {format(new Date(tx.created_at), 'MMM d, yyyy')}
        </div>
      </div>
      <div className={`font-mono font-medium text-sm ${color}`}>
        {sign}{Math.abs(tx.amount)} cr
      </div>
    </div>
  );
}

export default function Ledger() {
  const { user, transactions, reserve, stats, loading } = useApp();

  const given    = user?.lifetime_given    ?? 0;
  const received = user?.lifetime_received ?? 0;
  const ratio    = given + received > 0 ? Math.round((given / (given + received)) * 100) : 0;

  return (
    <div className="page-enter">
      <SectionHeader title="Ledger" subtitle="Your credit history & community health" />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Balance"  value={user?.credits ?? 0}  color={(user?.credits ?? 0) >= 0 ? 'text-moss-700' : 'text-clay-600'} sub="current" />
        <StatCard label="Given"    value={given}    color="text-moss-600" sub="all time" />
        <StatCard label="Received" value={received} color="text-clay-600" sub="all time" />
      </div>

      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-700 flex items-center gap-2">
            <TrendingUp size={14} className="text-moss-500" /> Giving ratio
          </span>
          <span className="font-mono text-sm text-moss-700">{ratio}% giving</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-moss-500 rounded-full transition-all duration-700" style={{ width: `${ratio}%` }} />
        </div>
        <p className="text-xs text-stone-400 mt-2">In a healthy LETS system, aim to give as much as you receive over time.</p>
      </div>

      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-stone-700 text-sm">Community Reserve</span>
          <span className="tag bg-moss-50 text-moss-700 border border-moss-100 text-xs">LETS Zero-Sum</span>
        </div>
        <ReserveBar balance={reserve.balance} donated={reserve.total_donated} />
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-stone-50">
          <div className="text-center">
            <div className="font-mono text-lg font-medium text-moss-700">{reserve.total_donated}</div>
            <div className="text-xs text-stone-400">Total donated</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-lg font-medium text-clay-600">{reserve.total_granted}</div>
            <div className="text-xs text-stone-400">Total granted</div>
          </div>
        </div>
        <p className="text-xs text-stone-400 mt-3 leading-relaxed">
          Every credit in the Reserve was donated by a community member. Grants are fully backed by real produce given to the Bin.
        </p>
      </div>

      <div className="card p-4 mb-5">
        <div className="font-medium text-stone-700 text-sm mb-3">Network health</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Active members',    stats.active_members],
            ['System credits',    stats.system_credits?.toLocaleString()],
            ['Active listings',   stats.listings_active],
            ['Season trades',     stats.trades_this_season],
          ].map(([k, v]) => (
            <div key={k} className="text-center p-3 bg-stone-50 rounded-xl">
              <div className="font-mono text-xl font-medium text-stone-800">{v ?? ' '}</div>
              <div className="text-xs text-stone-400">{k}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="font-medium text-stone-700 text-sm mb-1">Transaction log</div>
        <p className="text-xs text-stone-400 mb-4">Immutable once QR-confirmed at pickup.</p>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-stone-50 rounded-lg" />)}
          </div>
        ) : transactions.length === 0 ? (
          <Empty emoji="📋" title="No transactions yet" body="Your trade history will appear here." />
        ) : (
          transactions.map(tx => <TxRow key={tx.id} tx={tx} />)
        )}
      </div>
    </div>
  );
}
