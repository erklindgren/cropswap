import { useState } from 'react';
import { Plus, Camera, Leaf, Clock, Archive, Gift } from 'lucide-react';
import { SectionHeader, TierBadge, CreditBadge, FreshnessDot, Modal, Empty } from '../components/UI';
import { useApp } from '../context/AppContext';
import { TIER_INFO } from '../lib/data';

const GROWING_METHODS = ['Organic', 'No-Till', 'Permaculture', 'Biodynamic', 'Conventional', 'Seed-Saving', 'Container', 'Food Forest', 'Foraged'];

function AddListingModal({ onClose }) {
  const { addListing, donateToBin, notify } = useApp();
  const [form, setForm] = useState({ crop: '', variety: '', category: 'fresh', tier: 1, quantity: '', unit: 'bunch', description: '', best_by: '', surplus: false });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePublish = () => {
    if (!form.crop || !form.quantity || !form.best_by) { notify('Fill in crop name, quantity, and best-by date.', 'warning'); return; }
    const tier = TIER_INFO[form.tier];
    const listing = {
      crop:        form.crop,
      variety:     form.variety || null,
      category:    form.category,
      credit_tier: String(form.tier),
      credits:     tier.credits,
      quantity:    +form.quantity,
      unit:        form.unit,
      description: form.description || null,
      best_by:     form.best_by || null,
      surplus:     form.surplus,
      status:      'in_season',
      high_demand: false,
    };
    addListing(listing);
    onClose();
  };

  return (
    <Modal title="Add to the Stand" onClose={onClose} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Photo */}
        <div className="sm:col-span-2">
          <div className="border-2 border-dashed border-stone-200 rounded-2xl h-32 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-moss-300 hover:text-moss-500 transition-colors cursor-pointer bg-stone-50">
            <Camera size={24} />
            <span className="text-sm">Snap or upload a photo</span>
            <span className="text-xs text-stone-300">AI will suggest crop type & tier</span>
          </div>
        </div>

        {/* Crop name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Crop name *</label>
          <input className="input" placeholder="e.g. Cherry Tomatoes" value={form.crop} onChange={e => f('crop', e.target.value)} />
        </div>

        {/* Variety */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Variety <span className="text-stone-400 font-normal">(optional)</span></label>
          <input className="input" placeholder="e.g. Sungold" value={form.variety} onChange={e => f('variety', e.target.value)} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
          <select className="input" value={form.category} onChange={e => f('category', e.target.value)}>
            <option value="fresh">Fresh Produce</option>
            <option value="preserved">Preserved / Processed</option>
          </select>
        </div>

        {/* Tier */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Credit Tier</label>
          <select className="input" value={form.tier} onChange={e => f('tier', e.target.value)}>
            {Object.entries(TIER_INFO).map(([k, v]) => (
              <option key={k} value={k}>{v.label} — {v.credits} credits</option>
            ))}
          </select>
          <p className="text-xs text-stone-400 mt-1">{TIER_INFO[form.tier]?.description}</p>
        </div>

        {/* Quantity + unit */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Quantity *</label>
          <div className="flex gap-2">
            <input type="number" className="input w-24" placeholder="4" value={form.quantity} onChange={e => f('quantity', e.target.value)} />
            <select className="input flex-1" value={form.unit} onChange={e => f('unit', e.target.value)}>
              {['bunch','lb','oz','pint','jar','bag','each','braid'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Best by */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Best by *</label>
          <input type="date" className="input" value={form.best_by} onChange={e => f('best_by', e.target.value)} />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
          <textarea className="input min-h-[80px] resize-none" placeholder="Growing notes, flavor, harvest date, spray-free, etc." value={form.description} onChange={e => f('description', e.target.value)} />
        </div>

        {/* Surplus toggle */}
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => f('surplus', !form.surplus)}
              className={`w-10 h-5.5 rounded-full transition-colors relative ${form.surplus ? 'bg-moss-500' : 'bg-stone-200'}`}
              style={{ height: '22px', width: '40px' }}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.surplus ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-700">Take It All</div>
              <div className="text-xs text-stone-400">For windfalls — let someone claim the whole lot</div>
            </div>
          </label>
        </div>
      </div>

      {/* Credit summary */}
      <div className="mt-5 bg-moss-50 border border-moss-100 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm text-moss-700">You'll earn</span>
        <CreditBadge amount={TIER_INFO[form.tier]?.credits} />
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handlePublish} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Leaf size={15} /> Publish Listing
        </button>
      </div>
    </Modal>
  );
}

export default function Shed() {
  const { listings, user, donateToBin } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState('active');

  const myListings = listings.filter(l => l.user_id === user.id);
  const active  = myListings.filter(l => l.status === 'in_season');
  const soon    = myListings.filter(l => l.status === 'coming_soon');
  const dormant = myListings.filter(l => l.status === 'dormant');
  const shown   = tab === 'active' ? active : tab === 'soon' ? soon : dormant;

  return (
    <div className="page-enter">
      <SectionHeader
        title="Garden Shed"
        subtitle="Your listings & stewardship"
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Listing
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-5">
        {[['active', `In Season (${active.length})`, Clock], ['soon', `Coming Soon (${soon.length})`, Leaf], ['dormant', `Archived (${dormant.length})`, Archive]].map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty emoji="🌱" title={tab === 'active' ? 'Nothing in season yet' : 'Nothing here'} body={tab === 'active' ? 'Add your first listing to the Stand.' : ''} />
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map(l => (
            <div key={l.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ backgroundColor: l.photo_color + '22' }}>{l.photo_emoji}</div>
                  <div className="min-w-0">
                    <div className="font-medium text-stone-800">{l.crop}</div>
                    {l.variety && <div className="text-xs text-stone-400 italic">{l.variety}</div>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <TierBadge tier={l.tier} />
                      <FreshnessDot bestBy={l.best_by} />
                      <CreditBadge amount={l.credits} size="sm" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => donateToBin(l)} className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-clay-600 transition-colors">
                    <Gift size={13} /> Donate to Bin
                  </button>
                </div>
              </div>
              {l.description && <p className="text-stone-500 text-sm mt-3 leading-relaxed">{l.description}</p>}
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddListingModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
