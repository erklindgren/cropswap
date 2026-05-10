import { useState } from 'react';
import { Plus, Edit3, CheckCircle, MapPin, Award, Leaf, Calendar, LogOut } from 'lucide-react';
import { SectionHeader, TrustPill, Modal, Empty } from '../components/UI';
import { useApp } from '../context/AppContext';
import { signOut } from '../lib/supabase';
import { TRUST_TIERS } from '../lib/data';

const METHOD_COLORS = {
  organic:'bg-moss-50 text-moss-700', no_till:'bg-teal-50 text-teal-700',
  permaculture:'bg-emerald-50 text-emerald-700', biodynamic:'bg-violet-50 text-violet-700',
  conventional:'bg-stone-100 text-stone-600', seed_saving:'bg-amber-50 text-amber-700',
  container:'bg-sky-50 text-sky-700', food_forest:'bg-green-50 text-green-700',
  foraged:'bg-lime-50 text-lime-700',
};
const STATUS_LABELS = { in_season:'In Season', coming_soon:'Coming Soon', growing:'Growing', dormant:'Dormant' };
const STATUS_COLORS = { in_season:'text-moss-600 bg-moss-50', coming_soon:'text-soil-600 bg-soil-50', growing:'text-moss-600 bg-moss-50', dormant:'text-stone-400 bg-stone-50' };

function StewardshipModal({ items: initial, onClose }) {
  const { updateStewardship, notify } = useApp();
  const [items, setItems] = useState(initial || []);
  const addItem    = () => setItems(p => [...p, { crop:'', method:'organic', status:'growing', notes:'' }]);
  const updateItem = (i, k, v) => setItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));
  const removeItem = i => setItems(p => p.filter((_, idx) => idx !== i));
  const save = async () => {
    if (items.some(i => !i.crop)) { notify('Give each crop a name.', 'warning'); return; }
    await updateStewardship(items);
    onClose();
  };
  return (
    <Modal title="Edit Stewardship Profile" onClose={onClose} wide>
      <p className="text-sm text-stone-500 mb-4">Declare what you're growing this season — your identity in the collective.</p>
      {items.map((item, i) => (
        <div key={i} className="border border-stone-100 rounded-xl p-3 mb-3">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input className="input text-sm" placeholder="Crop name" value={item.crop} onChange={e => updateItem(i,'crop',e.target.value)} />
            <select className="input text-sm" value={item.status} onChange={e => updateItem(i,'status',e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <select className="input text-sm mb-2" value={item.method} onChange={e => updateItem(i,'method',e.target.value)}>
            {Object.keys(METHOD_COLORS).map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
          </select>
          <input className="input text-sm" placeholder="Notes — variety, story, lineage…" value={item.notes || ''} onChange={e => updateItem(i,'notes',e.target.value)} />
          <button onClick={() => removeItem(i)} className="text-xs text-stone-400 hover:text-clay-500 mt-2 transition-colors">Remove</button>
        </div>
      ))}
      <button onClick={addItem} className="btn-secondary w-full flex items-center justify-center gap-2 mb-5 text-sm">
        <Plus size={14} /> Add Crop
      </button>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={save} className="btn-primary flex-1">Save Profile</button>
      </div>
    </Modal>
  );
}

export default function Profile() {
  const { user, tradeRequests, confirmTrade, stewardship, loading } = useApp();
  const [editStewardship, setEdit] = useState(false);

  const myTier   = TRUST_TIERS.find(t => t.name?.toLowerCase() === user?.trust_tier) || TRUST_TIERS[0];
  const nextTier = TRUST_TIERS.find(t => t.level === myTier.level + 1);
  const pending  = (tradeRequests || []).filter(t => t.status === 'pending');
  const confirmed = (tradeRequests || []).filter(t => t.status === 'confirmed');

  if (loading || !user) return (
    <div className="animate-pulse space-y-4 page-enter">
      <div className="card h-48" />
      <div className="card h-24" />
    </div>
  );

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="card mb-5 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-moss-700 to-moss-900 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage:'radial-gradient(circle at 20% 50%, #80AD48 0%, transparent 50%)' }} />
        </div>
        <div className="px-5 pb-5 -mt-8">
          <div className="w-16 h-16 rounded-2xl bg-moss-600 flex items-center justify-center text-2xl text-white font-display font-bold shadow-card border-4 border-white mb-3">
            {(user.display_name || 'U').split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl text-stone-800">{user.display_name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <TrustPill tier={user.trust_tier} />
                {user.is_admin && <span className="tag bg-stone-800 text-white text-xs">Admin</span>}
                {user.verified && <CheckCircle size={14} className="text-moss-500" />}
              </div>
              {user.bio && <p className="text-stone-500 text-sm mt-2 italic leading-relaxed">{user.bio}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
            {user.location_label && <span className="flex items-center gap-1"><MapPin size={11} />{user.location_label}</span>}
            <span className="flex items-center gap-1"><Calendar size={11} />Joined {new Date(user.joined_at).toLocaleDateString('en-US',{month:'short',year:'numeric'})}</span>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[['Balance', user.credits, (user.credits??0) >= 0 ? 'text-moss-700':'text-clay-600'],
          ['Given', user.lifetime_given, 'text-stone-700'],
          ['Received', user.lifetime_received, 'text-stone-700']].map(([label, val, color]) => (
          <div key={label} className="card p-3 text-center">
            <div className={`font-mono text-2xl font-medium ${color}`}>{val ?? 0}</div>
            <div className="text-xs text-stone-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Trust tier */}
      <div className="card p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: myTier.color + '22' }}>
            <Award size={18} style={{ color: myTier.color }} />
          </div>
          <div className="flex-1">
            <div className="font-medium text-stone-800">{myTier.name}</div>
            <div className="text-xs text-stone-400">{myTier.description}</div>
          </div>
        </div>
        {nextTier && (
          <div className="mt-3 pt-3 border-t border-stone-50">
            <div className="flex justify-between text-xs text-stone-500 mb-1.5">
              <span>Progress to {nextTier.name}</span>
              <span>{nextTier.min_trades} trades needed</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-moss-400 rounded-full" style={{ width: `${Math.min(100, ((user.trade_count||0) / nextTier.min_trades) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Stewardship */}
      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-medium text-stone-800 flex items-center gap-2"><Leaf size={14} className="text-moss-500" /> Stewardship Profile</div>
            <div className="text-xs text-stone-400 mt-0.5">What you're growing this season</div>
          </div>
          <button onClick={() => setEdit(true)} className="btn-ghost text-sm flex items-center gap-1.5 py-1.5 px-3">
            <Edit3 size={13} /> Edit
          </button>
        </div>
        {!stewardship?.length ? (
          <Empty emoji="🌱" title="No stewardship declared yet" body="Tell the community what you're growing — varieties, methods, and the stories behind them." />
        ) : (
          <div className="flex flex-col gap-3">
            {stewardship.map((item, i) => (
              <div key={i} className="bg-stone-50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-stone-800 text-sm">{item.crop}{item.variety ? ` — ${item.variety}` : ''}</div>
                  <span className={`tag text-xs ${STATUS_COLORS[item.status] || STATUS_COLORS.growing}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <span className={`tag text-xs mt-1.5 ${METHOD_COLORS[item.method] || 'bg-stone-100 text-stone-600'}`}>
                  {(item.method || '').replace('_', ' ')}
                </span>
                {item.notes && <p className="text-xs text-stone-500 mt-2 italic leading-relaxed">{item.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trade requests */}
      {pending.length > 0 && (
        <div className="card p-4 mb-5">
          <div className="font-medium text-stone-800 mb-3">Pending Trade Requests</div>
          {pending.map(t => (
            <div key={t.id} className="border border-stone-100 rounded-xl p-3 mb-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-sm font-medium text-stone-700">{t.offer_description}</div>
                <span className="tag bg-amber-50 text-amber-700 text-xs">Pending</span>
              </div>
              <div className="text-xs text-stone-500 mb-3">For: {t.listings?.crop}</div>
              <div className="flex gap-2">
                <button onClick={() => confirmTrade(t.id)} className="btn-primary text-xs px-3 py-1.5">Confirm</button>
                <button className="btn-secondary text-xs px-3 py-1.5">Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sign out */}
      <button onClick={() => signOut()} className="btn-secondary w-full flex items-center justify-center gap-2 text-stone-500">
        <LogOut size={15} /> Sign Out
      </button>

      {editStewardship && <StewardshipModal items={stewardship} onClose={() => setEdit(false)} />}
    </div>
  );
}
