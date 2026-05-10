import { useState } from 'react';
import { Plus, Camera, Leaf, Clock, Archive, Gift, RotateCcw, Trash2 } from 'lucide-react';
import { SectionHeader, TierBadge, CreditBadge, FreshnessDot, Modal, ConfirmModal, Empty, CropPhoto } from '../components/UI';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { TIER_INFO } from '../lib/data';

const UNITS = ['bunch','lb','oz','pint','jar','bag','each','braid'];

function ListingForm({ initial = {}, onClose, onSave, title = 'Add to the Stand' }) {
  const { notify } = useApp();
  const [form, setForm] = useState({
    crop:        initial.crop        || '',
    variety:     initial.variety     || '',
    category:    initial.category    || 'fresh',
    tier:        initial.credit_tier || initial.tier || 1,
    quantity:    initial.quantity    || '',
    unit:        initial.unit        || 'bunch',
    description: initial.description || '',
    best_by:     initial.best_by     || '',
    surplus:     initial.surplus     || false,
    status:      initial.status === 'coming_soon' ? 'coming_soon' : 'in_season',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };

  const validate = () => {
    const errs = {};
    if (!form.crop.trim())              errs.crop     = 'Crop name is required';
    if (!form.quantity || +form.quantity < 1) errs.quantity = 'Quantity must be at least 1';
    if (form.status === 'in_season' && !form.best_by) errs.best_by = 'Best-by date is required for in-season listings';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const tier = TIER_INFO[form.tier] || TIER_INFO[1];
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
      status:      form.status,
      high_demand: false,
    };
    await onSave(listing);
    setLoading(false);
    onClose();
  };

  return (
    <Modal title={title} onClose={onClose} wide>
      {/* Status toggle */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-4">
        {[['in_season','In Season'],['coming_soon','Coming Soon']].map(([k, label]) => (
          <button key={k} onClick={() => f('status', k)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.status === k ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Crop name *</label>
          <input className={`input ${errors.crop ? 'border-clay-400' : ''}`}
            placeholder="e.g. Cherry Tomatoes" value={form.crop} onChange={e => f('crop', e.target.value)} />
          {errors.crop && <p className="text-clay-600 text-xs mt-1">{errors.crop}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Variety <span className="text-stone-400 font-normal">(optional)</span></label>
          <input className="input" placeholder="e.g. Sungold" value={form.variety} onChange={e => f('variety', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
          <select className="input" value={form.category} onChange={e => f('category', e.target.value)}>
            <option value="fresh">Fresh Produce</option>
            <option value="preserved">Preserved / Processed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Credit Tier</label>
          <select className="input" value={form.tier} onChange={e => f('tier', e.target.value)}>
            {Object.entries(TIER_INFO).map(([k, v]) => (
              <option key={k} value={k}>{v.label}   {v.credits} credits</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Quantity *</label>
          <div className="flex gap-2">
            <input type="number" min="1"
              className={`input w-24 ${errors.quantity ? 'border-clay-400' : ''}`}
              placeholder="4" value={form.quantity} onChange={e => f('quantity', e.target.value)} />
            <select className="input flex-1" value={form.unit} onChange={e => f('unit', e.target.value)}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          {errors.quantity && <p className="text-clay-600 text-xs mt-1">{errors.quantity}</p>}
        </div>

        {form.status === 'in_season' && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Best by *</label>
            <input type="date" className={`input ${errors.best_by ? 'border-clay-400' : ''}`}
              value={form.best_by} onChange={e => f('best_by', e.target.value)} />
            {errors.best_by && <p className="text-clay-600 text-xs mt-1">{errors.best_by}</p>}
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
          <textarea className="input min-h-[72px] resize-none"
            placeholder="Growing notes, flavor, spray-free, harvest date..."
            value={form.description} onChange={e => f('description', e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => f('surplus', !form.surplus)}
              className={`relative rounded-full transition-colors flex-shrink-0 ${form.surplus ? 'bg-moss-500' : 'bg-stone-200'}`}
              style={{ width:40, height:22 }}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.surplus ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-700">Take It All</div>
              <div className="text-xs text-stone-400">For windfalls   let someone claim the whole lot</div>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-4 bg-moss-50 border border-moss-100 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm text-moss-700">Credits earned when traded</span>
        <CreditBadge amount={TIER_INFO[form.tier]?.credits} />
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleSave} disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Leaf size={15} /> {title === 'Add to the Stand' ? 'Publish' : 'Save'}</>}
        </button>
      </div>
    </Modal>
  );
}

export default function Shed() {
  const { listings, user, addListing, donateToBin, notify } = useApp();
  const [showAdd, setShowAdd]             = useState(false);
  const [tab, setTab]                     = useState('active');
  const [donateTarget, setDonateTarget]   = useState(null);
  const [removeTarget, setRemoveTarget]   = useState(null);
  const [reuseItem, setReuseItem]         = useState(null);

  const myListings = listings.filter(l => l.user_id === user?.id);
  const active  = myListings.filter(l => l.status === 'in_season');
  const soon    = myListings.filter(l => l.status === 'coming_soon');
  const archived = myListings.filter(l => l.status === 'dormant' || l.status === 'expired' || l.status === 'claimed');
  const shown   = tab === 'active' ? active : tab === 'soon' ? soon : archived;

  const archiveListing = async (listing) => {
    try {
      await supabase.from('listings').update({ status: 'dormant' }).eq('id', listing.id);
      notify('Moved to archive.');
      setTimeout(() => window.location.reload(), 300);
    } catch (err) { notify(err.message, 'warning'); }
  };

  const restoreListing = async (listing) => {
    try {
      await supabase.from('listings').update({ status: 'in_season' }).eq('id', listing.id);
      notify('Listing restored to In Season.');
      setTimeout(() => window.location.reload(), 300);
    } catch (err) { notify(err.message, 'warning'); }
  };

  const deleteListing = async (listing) => {
    try {
      await supabase.from('listings').delete().eq('id', listing.id);
      notify('Listing removed.');
      setTimeout(() => window.location.reload(), 300);
    } catch (err) { notify(err.message, 'warning'); }
  };

  return (
    <div className="page-enter">
      <SectionHeader
        title="Garden Shed"
        subtitle="Your listings and stewardship"
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Listing
          </button>
        }
      />

      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-5">
        {[['active',`In Season (${active.length})`,Clock],['soon',`Coming Soon (${soon.length})`,Leaf],['archived',`Archive (${archived.length})`,Archive]].map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === k ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            <Icon size={13} /><span className="truncate hidden sm:inline">{label}</span>
            <span className="sm:hidden">{Icon === Clock ? 'Active' : Icon === Leaf ? 'Soon' : 'Archive'}</span>
          </button>
        ))}
      </div>

      {tab === 'archived' && archived.length > 0 && (
        <div className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 text-xs text-stone-500 mb-4">
          Tap a past listing to use it as a template for a new one.
        </div>
      )}

      {shown.length === 0 ? (
        <Empty emoji={tab === 'soon' ? '🌱' : tab === 'archived' ? '📦' : '🌿'}
          title={tab === 'active' ? 'Nothing in season yet' : tab === 'soon' ? 'Nothing coming soon' : 'Archive is empty'}
          body={tab === 'active' ? 'Add your first listing to the Stand.' : tab === 'soon' ? 'Add a listing and set it to Coming Soon.' : ''} />
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map(l => (
            <div key={l.id} className={`card p-4 ${tab === 'archived' ? 'cursor-pointer hover:shadow-lift transition-shadow' : ''}`}
              onClick={tab === 'archived' ? () => setReuseItem(l) : undefined}>
              <div className="flex items-start gap-3">
                <CropPhoto listing={l} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800">{l.crop}</div>
                  {l.variety && <div className="text-xs text-stone-400">{l.variety}</div>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <TierBadge tier={parseInt(l.credit_tier || l.tier)} />
                    {l.best_by && <FreshnessDot bestBy={l.best_by} />}
                    <CreditBadge amount={l.credits} size="sm" />
                    <span className="text-xs text-stone-400">{l.quantity} {l.unit}</span>
                  </div>
                </div>
                {/* Action buttons */}
                {tab !== 'archived' && (
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => setDonateTarget(l)}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-clay-600 transition-colors">
                      <Gift size={12} /> Donate
                    </button>
                    <button onClick={() => archiveListing(l)}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                      <Archive size={12} /> Archive
                    </button>
                  </div>
                )}
                {tab === 'archived' && (
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); restoreListing(l); }}
                      className="flex items-center gap-1 text-xs text-moss-600 hover:text-moss-800 transition-colors">
                      <RotateCcw size={12} /> Restore
                    </button>
                    <button onClick={e => { e.stopPropagation(); setRemoveTarget(l); }}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-clay-600 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
              {l.description && <p className="text-stone-500 text-sm mt-3 leading-relaxed">{l.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <ListingForm
          title="Add to the Stand"
          onClose={() => setShowAdd(false)}
          onSave={addListing}
        />
      )}

      {reuseItem && (
        <ListingForm
          title={`Relist: ${reuseItem.crop}`}
          initial={reuseItem}
          onClose={() => setReuseItem(null)}
          onSave={addListing}
        />
      )}

      {donateTarget && (
        <ConfirmModal
          title="Donate to the Pantry?"
          message={`This removes "${donateTarget.crop}" from your Shed and donates it to the Pantry. The Community Reserve will receive ${donateTarget.credits} credits on your behalf.`}
          confirmLabel="Donate"
          onConfirm={() => donateToBin(donateTarget)}
          onClose={() => setDonateTarget(null)}
        />
      )}

      {removeTarget && (
        <ConfirmModal
          title="Delete this listing?"
          message={`"${removeTarget.crop}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          danger={true}
          onConfirm={() => deleteListing(removeTarget)}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
