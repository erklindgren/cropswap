import { useState, useEffect } from 'react';
import { Plus, Camera, Leaf, Clock, Archive, Gift, Edit3 } from 'lucide-react';
import { SectionHeader, TierBadge, CreditBadge, FreshnessDot, Modal, ConfirmModal, Empty, CropPhoto } from '../components/UI';
import { useApp } from '../context/AppContext';
import { TIER_INFO } from '../lib/data';

const UNITS = ['bunch','lb','oz','pint','jar','bag','each','braid'];

function AddListingModal({ onClose }) {
  const { addListing, notify } = useApp();
  const [form, setForm] = useState({ crop:'', variety:'', category:'fresh', tier:1, quantity:'', unit:'bunch', description:'', best_by:'', surplus:false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | getting | got | denied
  const [coords, setCoords] = useState(null);

  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  // Capture geolocation when modal opens
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus('getting');
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoStatus('got'); },
      ()  => setGeoStatus('denied')
    );
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.crop.trim())  errs.crop     = 'Crop name is required';
    if (!form.quantity || +form.quantity < 1) errs.quantity = 'Quantity must be at least 1';
    if (!form.best_by)      errs.best_by  = 'Best-by date is required';
    return errs;
  };

  const handlePublish = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const tier = TIER_INFO[form.tier];
    const listing = {
      crop:        form.crop.trim(),
      variety:     form.variety.trim() || null,
      category:    form.category,
      credit_tier: String(form.tier),
      credits:     tier.credits,
      quantity:    +form.quantity,
      unit:        form.unit,
      description: form.description.trim() || null,
      best_by:     form.best_by || null,
      surplus:     form.surplus,
      status:      'in_season',
      high_demand: false,
      ...(coords ? { location: `POINT(${coords.lng} ${coords.lat})` } : {}),
    };
    await addListing(listing);
    setLoading(false);
    onClose();
  };

  return (
    <Modal title="Add to the Stand" onClose={onClose} wide>
      {/* Photo */}
      <div className="border-2 border-dashed border-stone-200 rounded-2xl h-28 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-moss-300 hover:text-moss-500 transition-colors cursor-pointer bg-stone-50 mb-4">
        <Camera size={22} />
        <span className="text-sm">Snap or upload a photo</span>
        <span className="text-xs text-stone-300">AI will suggest crop type & tier</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Crop name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Crop name *</label>
          <input className={`input ${errors.crop ? 'border-clay-400 ring-1 ring-clay-300' : ''}`}
            placeholder="e.g. Cherry Tomatoes" value={form.crop} onChange={e => f('crop', e.target.value)} />
          {errors.crop && <p className="text-clay-600 text-xs mt-1">{errors.crop}</p>}
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

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Quantity *</label>
          <div className="flex gap-2">
            <input type="number" min="1"
              className={`input w-24 ${errors.quantity ? 'border-clay-400 ring-1 ring-clay-300' : ''}`}
              placeholder="4" value={form.quantity} onChange={e => f('quantity', e.target.value)} />
            <select className="input flex-1" value={form.unit} onChange={e => f('unit', e.target.value)}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          {errors.quantity && <p className="text-clay-600 text-xs mt-1">{errors.quantity}</p>}
        </div>

        {/* Best by */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Best by *</label>
          <input type="date" className={`input ${errors.best_by ? 'border-clay-400 ring-1 ring-clay-300' : ''}`}
            value={form.best_by} onChange={e => f('best_by', e.target.value)} />
          {errors.best_by && <p className="text-clay-600 text-xs mt-1">{errors.best_by}</p>}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
          <textarea className="input min-h-[72px] resize-none"
            placeholder="Growing notes, flavor, spray-free, harvest date…"
            value={form.description} onChange={e => f('description', e.target.value)} />
        </div>

        {/* Surplus toggle */}
        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => f('surplus', !form.surplus)}
              className={`relative rounded-full transition-colors flex-shrink-0 ${form.surplus ? 'bg-moss-500' : 'bg-stone-200'}`}
              style={{ width:40, height:22 }}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.surplus ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-700">Take It All</div>
              <div className="text-xs text-stone-400">For windfalls — let someone claim the whole lot</div>
            </div>
          </label>
        </div>
      </div>

      {/* Geo status */}
      {geoStatus === 'got' && (
        <div className="mt-4 bg-moss-50 border border-moss-100 rounded-xl px-3 py-2 text-xs text-moss-700 flex items-center gap-2">
          📍 Location captured — listing will appear on the map
        </div>
      )}
      {geoStatus === 'denied' && (
        <div className="mt-4 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 text-xs text-stone-500">
          Location not available — listing will show without map pin
        </div>
      )}

      {/* Credit summary */}
      <div className="mt-4 bg-moss-50 border border-moss-100 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm text-moss-700">You'll earn when traded</span>
        <CreditBadge amount={TIER_INFO[form.tier]?.credits} />
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handlePublish} disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Leaf size={15} /> Publish Listing</>}
        </button>
      </div>
    </Modal>
  );
}

export default function Shed() {
  const { listings, user, donateToBin } = useApp();
  const [showAdd, setShowAdd]         = useState(false);
  const [tab, setTab]                 = useState('active');
  const [donateTarget, setDonateTarget] = useState(null);

  const myListings = listings.filter(l => l.user_id === user?.id);
  const active  = myListings.filter(l => l.status === 'in_season');
  const soon    = myListings.filter(l => l.status === 'coming_soon');
  const dormant = myListings.filter(l => l.status === 'dormant' || l.status === 'expired');
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
        {[['active',`In Season (${active.length})`,Clock],['soon',`Coming Soon (${soon.length})`,Leaf],['dormant',`Archived (${dormant.length})`,Archive]].map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            <Icon size={14} /><span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty emoji="🌱" title={tab === 'active' ? 'Nothing in season yet' : 'Nothing here'}
          body={tab === 'active' ? 'Add your first listing to the Stand.' : ''} />
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map(l => (
            <div key={l.id} className="card p-4">
              <div className="flex items-start gap-3">
                <CropPhoto listing={l} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800">{l.crop}</div>
                  {l.variety && <div className="text-xs text-stone-400 italic">{l.variety}</div>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <TierBadge tier={parseInt(l.credit_tier || l.tier)} />
                    {l.best_by && <FreshnessDot bestBy={l.best_by} />}
                    <CreditBadge amount={l.credits} size="sm" />
                    <span className="text-xs text-stone-400">{l.quantity} {l.unit}</span>
                  </div>
                </div>
                <button onClick={() => setDonateTarget(l)}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-clay-600 transition-colors flex-shrink-0 mt-1">
                  <Gift size={13} /> Donate
                </button>
              </div>
              {l.description && <p className="text-stone-500 text-sm mt-3 leading-relaxed">{l.description}</p>}
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddListingModal onClose={() => setShowAdd(false)} />}

      {donateTarget && (
        <ConfirmModal
          title="Donate to Community Bin?"
          message={`This will remove "${donateTarget.crop}" from your Shed and donate it to the Community Bin for free. The Community Reserve will be credited ${donateTarget.credits} credits.`}
          confirmLabel="Donate"
          danger={false}
          onConfirm={() => donateToBin(donateTarget)}
          onClose={() => setDonateTarget(null)}
        />
      )}
    </div>
  );
}
